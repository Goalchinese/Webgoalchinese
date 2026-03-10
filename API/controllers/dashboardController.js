const { sequelize, Account } = require("../models");

// Simple in-memory cache for dashboard data
const dashboardCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for near real-time updates

exports.getSummaryUser = async (req, res) => {
  try {
    const result = await sequelize.query(
      `WITH StudentTypes AS (
        SELECT id, name FROM StudentType
      ),
      StudentCounts AS (
        SELECT 
          st.id as studentTypeId,
          st.name as studentTypeName,
          COUNT(a.id) as studentCount
        FROM StudentTypes st
        LEFT JOIN Account a ON st.id = a.studentTypeID AND a.status = 'Active'
        GROUP BY st.id, st.name
      )
      SELECT
        COALESCE(SUM(CASE WHEN sc.studentTypeName = 'online' THEN sc.studentCount ELSE 0 END), 0) AS totalOnlineStudent,
        COALESCE(SUM(CASE WHEN sc.studentTypeName = 'offline' THEN sc.studentCount ELSE 0 END), 0) AS totalOfflineStudent,
        (SELECT COUNT(*) FROM User WHERE role = 'teacher') AS totalTeacher,
        (SELECT COUNT(*) FROM User WHERE role in ('user', 'admin', 'superadmin')) AS totalAdmin
      FROM StudentCounts sc`,
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
      // Query 1: Summary User (dynamic based on student types in settings)
      sequelize.query(
        `WITH StudentTypes AS (
          SELECT id, name FROM StudentType
        ),
        StudentCounts AS (
          SELECT 
            st.id as studentTypeId,
            st.name as studentTypeName,
            COUNT(a.id) as studentCount
          FROM StudentTypes st
          LEFT JOIN Account a ON st.id = a.studentTypeID AND a.status = 'Active'
          GROUP BY st.id, st.name
        )
        SELECT
          COALESCE(SUM(CASE WHEN sc.studentTypeName = 'online' THEN sc.studentCount ELSE 0 END), 0) AS totalOnlineStudent,
          COALESCE(SUM(CASE WHEN sc.studentTypeName = 'offline' THEN sc.studentCount ELSE 0 END), 0) AS totalOfflineStudent,
          (SELECT COUNT(*) FROM User WHERE role = 'teacher') AS totalTeacher,
          (SELECT COUNT(*) FROM User WHERE role in ('user', 'admin', 'superadmin')) AS totalAdmin
        FROM StudentCounts sc`,
        { type: sequelize.QueryTypes.SELECT }
      ),
      // Query 2: Summary Branch - Optimized with JOINs instead of subqueries
      sequelize.query(
        `SELECT 
          b.id, 
          b.name,
          COALESCE(c.totalClass, 0) as totalClass,
          COALESCE(a.totalStudent, 0) as totalStudent,
          COALESCE(e.totalExpireClass, 0) as totalExpireClass,
          COALESCE(f.totalIncomeClass, 0) as totalIncomeClass
        FROM Branch b
        LEFT JOIN (
          SELECT branchID, COUNT(id) as totalClass 
          FROM Class 
          GROUP BY branchID
        ) c ON b.id = c.branchID
        LEFT JOIN (
          SELECT a.branchID, COUNT(a.id) as totalStudent 
          FROM Account a
          INNER JOIN StudentType st ON a.studentTypeID = st.id
          WHERE st.name IN ('online', 'offline') AND a.status = 'Active'
          GROUP BY a.branchID
        ) a ON b.id = a.branchID
        LEFT JOIN (
          SELECT 
            c.branchID, 
            COUNT(DISTINCT c.id) as totalExpireClass
          FROM Class c
          INNER JOIN Attendance att ON c.id = att.classId
          WHERE c.status = 'Active'
          GROUP BY c.id, c.branchID, c.registeredTimes
          HAVING c.registeredTimes - COUNT(att.id) < 3
        ) e ON b.id = e.branchID
        LEFT JOIN (
          SELECT 
            a.branchID, 
            SUM(fs.classFee) as totalIncomeClass
          FROM Account a
          INNER JOIN FeeStructure fs ON a.id = fs.accountID
          WHERE MONTH(fs.payDate) = MONTH(CURRENT_DATE()) 
            AND YEAR(fs.payDate) = YEAR(CURRENT_DATE())
          GROUP BY a.branchID
        ) f ON b.id = f.branchID`,
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
      summaryBranch: summaryBranch[0] ? [summaryBranch[0]] : [], // Take only first item
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
