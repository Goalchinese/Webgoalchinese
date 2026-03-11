const { sequelize, Account } = require("../models");

// Simple in-memory cache for dashboard data
const dashboardCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for near real-time updates

exports.getSummaryUser = async (req, res) => {
  try {
    const result = await sequelize.query(
      `SELECT
        (SELECT COUNT(*) FROM Account a 
         INNER JOIN StudentType st ON a.studentTypeID = st.id 
         WHERE st.name = 'online' AND a.status = 'Active') AS totalOnlineStudent,
        (SELECT COUNT(*) FROM Account a 
         INNER JOIN StudentType st ON a.studentTypeID = st.id 
         WHERE st.name = 'offline' AND a.status = 'Active') AS totalOfflineStudent,
        (SELECT COUNT(*) FROM User WHERE role = 'teacher') AS totalTeacher,
        (SELECT COUNT(*) FROM User WHERE role in ('user', 'admin', 'superadmin')) AS totalAdmin`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json(result[0]);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving summary", error: error.message });
  }
};

exports.getSummaryBranch = async (req, res) => {
  try {
    const currentDate = new Date();
    const result = await sequelize.query(
      `

	  SELECT 
	  id,
	  name,
	  (
	SELECT 
		  count(Class.id)
	FROM
		  Class
	WHERE
		  Class.branchID = b.id
	  ) as totalClass,
	  (
	SELECT 
			  COUNT(a.id) AS student_count
		FROM
		Account a
		WHERE 
			a.branchID = b.id
		AND
          MONTH(a.addmissionDate) = MONTH(CURRENT_DATE())
		and YEAR(a.addmissionDate) = YEAR(CURRENT_DATE())
		GROUP BY
			 	a.branchID
	  ) as totalStudent,
	  (
	SELECT
		  count(id)
	FROM
		  (
		SELECT 
			  id
		FROM
			  Class c
		WHERE
			  c.id in (
			select
				  classId
			from
				  Attendance a
			GROUP by
				  classId
			having
				  c.registeredTimes - count(a.id) < 3 
	  )
				and c.branchID = b.id
				and c.status = 'Active'
			GROUP BY
				  id,
				  b.id
	  ) subquery
	  ) as totalExpireClass,
	  (
	SELECT
		sum(totalIncomeClass)
	FROM
		(
		SELECT
			sum(fs.classFee) as totalIncomeClass
		FROM
			Account a,
			FeeStructure fs
		WHERE
			a.id = fs.accountID
			and
			a.branchID = b.id
			AND
          MONTH(fs.payDate) = MONTH(CURRENT_DATE())
				and YEAR(fs.payDate) = YEAR(CURRENT_DATE())
			GROUP BY
				a.branchID
          )subquery
  
  ) as totalIncomeClass
FROM
	  Branch b ;
	  
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving summary", error: error.message });
  }
};

// Combined dashboard data - single API call for all dashboard data with caching
exports.getDashboardData = async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'dashboard-data';
    const cached = dashboardCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Serving dashboard data from cache');
      return res.status(200).json(cached.data);
    }

    // Run all queries in parallel with optimized SQL
    const [summaryUser, summaryBranch, summaryIncome] = await Promise.all([
      // Query 1: Summary User (simple subqueries)
      sequelize.query(
        `SELECT
          (SELECT COUNT(*) FROM Account a 
           INNER JOIN StudentType st ON a.studentTypeID = st.id 
           WHERE st.name = 'online' AND a.status = 'Active') AS totalOnlineStudent,
          (SELECT COUNT(*) FROM Account a 
           INNER JOIN StudentType st ON a.studentTypeID = st.id 
           WHERE st.name = 'offline' AND a.status = 'Active') AS totalOfflineStudent,
          (SELECT COUNT(*) FROM User WHERE role = 'teacher') AS totalTeacher,
          (SELECT COUNT(*) FROM User WHERE role in ('user', 'admin', 'superadmin')) AS totalAdmin`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      // Query 2: Summary Branch - Group by student type across all branches
      sequelize.query(
        `WITH StudentTypes AS (
          SELECT id, name FROM StudentType
        ),
        ClassCounts AS (
          SELECT 
            a.studentTypeID,
            COUNT(DISTINCT c.id) as classCount
          FROM Account a
          LEFT JOIN Class c ON a.branchID = c.branchID
          WHERE a.status = 'Active'
          GROUP BY a.studentTypeID
        ),
        StudentCounts AS (
          SELECT 
            studentTypeID,
            COUNT(id) as studentCount
          FROM Account
          WHERE status = 'Active'
          GROUP BY studentTypeID
        ),
        ExpiringClassCounts AS (
          SELECT 
            studentTypeID,
            COUNT(DISTINCT classId) as expiringClassCount
          FROM (
            SELECT 
              a.studentTypeID,
              c.id as classId,
              c.registeredTimes,
              COUNT(att.id) as attendanceCount
            FROM Account a
            LEFT JOIN Class c ON a.branchID = c.branchID AND c.status = 'Active'
            LEFT JOIN Attendance att ON c.id = att.classId
            WHERE a.status = 'Active' AND c.id IS NOT NULL
            GROUP BY a.studentTypeID, c.id, c.registeredTimes
            HAVING c.registeredTimes - COUNT(att.id) < 3
          ) expiringClasses
          GROUP BY studentTypeID
        ),
        IncomeCounts AS (
          SELECT 
            a.studentTypeID,
            COALESCE(SUM(fs.classFee), 0) as incomeCount
          FROM Account a
          LEFT JOIN FeeStructure fs ON a.id = fs.accountID 
            AND MONTH(fs.payDate) = MONTH(CURRENT_DATE()) 
            AND YEAR(fs.payDate) = YEAR(CURRENT_DATE())
          WHERE a.status = 'Active'
          GROUP BY a.studentTypeID
        )
        SELECT 
          st.name as studentTypeName,
          COALESCE(cc.classCount, 0) as totalClass,
          COALESCE(sc.studentCount, 0) as totalStudent,
          COALESCE(ec.expiringClassCount, 0) as totalExpireClass,
          COALESCE(ic.incomeCount, 0) as totalIncomeClass
        FROM StudentTypes st
        LEFT JOIN ClassCounts cc ON st.id = cc.studentTypeID
        LEFT JOIN StudentCounts sc ON st.id = sc.studentTypeID
        LEFT JOIN ExpiringClassCounts ec ON st.id = ec.studentTypeID
        LEFT JOIN IncomeCounts ic ON st.id = ic.studentTypeID`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      // Query 3: Summary Income
      sequelize.query(
        `SELECT YEAR(FeeStructure.payDate) as year, SUM(FeeStructure.classFee) as totalIncome
         FROM FeeStructure WHERE FeeStructure.classFee > 0 AND YEAR(FeeStructure.payDate) = YEAR(CURRENT_DATE())
         GROUP BY YEAR(FeeStructure.payDate)`,
        { type: sequelize.QueryTypes.SELECT }
      ),
    ]);

    const result = {
      summaryUser: summaryUser[0] || {},
      summaryBranch: summaryBranch || [],
      summaryIncome: summaryIncome || [],
    };

    // Cache the result
    dashboardCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log('Dashboard data cached for 15 minutes');
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving dashboard data", error: error.message });
  }
};

// summary income by year and branch optional
exports.getSummaryIncome = async (req, res) => {
  try {
    let where = ` AND YEAR(FeeStructure.payDate) = YEAR(CURRENT_DATE())`;

    const result = await sequelize.query(
      `
SELECT
	YEAR(FeeStructure.payDate) as year,
	SUM(FeeStructure.classFee) as totalIncome
FROM
	FeeStructure
WHERE
	FeeStructure.classFee > 0
	${where}
GROUP BY
	YEAR(FeeStructure.payDate)
	  `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving summary", error: error.message });
  }
};
