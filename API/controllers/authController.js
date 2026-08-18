const logger = require("../logger");
const { sequelize, User, Account, Permission } = require("../models"); // Ensure correct path
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Login Function
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Step 1: Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    //check if user is expired
    if (user.expireDate && new Date(user.expireDate) < new Date()) {
      logger.warn(`Failed login attempt for user: ${user.username}`);
      return res.status(400).json({ error: "User expired" });
    }

    // Step 2: Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${user.username}`);
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const [account, permissions] = await Promise.all([
      Account.findOne({ where: { id: user.accountID, status: "Active" } }),
      Permission.findAll({ where: { accountID: user.accountID } }),
    ]);
    if (!account) {
      logger.warn(`Failed login attempt for user: ${user.username}`);
      return res.status(400).json({ error: "Account is not active" });
    }

    // Step 3: Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        accountID: user.accountID,
        name: account.name,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret", // Use a secure secret in production
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        accountID: user.accountID,
        username: user.username,
        name: account.name,
        photo: account.photo,
        role: user.role,
        permissions,
        token,
      },
    });

    logger.info(`User ${user.username} logged in`);
  } catch (error) {
    logger.error(`Error occurred while logging in user: ${user.username}`, error);
    res.status(500).json({ error: error.message });
  }
};

// register Function
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get field names from the model
  const validFieldsAccount = Object.keys(Account.rawAttributes);

  // Filter req.body to include only valid fields
  const filteredDataAccount = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => validFieldsAccount.includes(key))
  );

  const t = await sequelize.transaction();

  try {
    // Step 1: Create the Account
    const account = await Account.create(
      {
        ...filteredDataAccount,
      },
      { transaction: t }
    );

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Step 2: Insert into User using the generated accountID
    const user = await User.create(
      {
        accountID: account.id,
        username: req.body.username,
        password: hashedPassword,
        role: req.body.role || "user",
        expireDate: req.body.expireDate,
      },
      { transaction: t }
    );

    if (req.body.permissions) {
      const bodyPermissions = JSON.parse(req.body.permissions);
      // Delete all permissions for the account
      // Insert new permissions
      await Permission.bulkCreate(
        bodyPermissions.map((p) => ({ ...p, accountID: account.id })),
        { transaction: t }
      );
    }

    logger.info(`Account created: ${account.id} ${req.body.username}`);

    res.status(201).json({
      message: "Account and User created successfully",
      account,
      user,
    });
    await t.commit();
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
