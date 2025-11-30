
const startServer = async (app, PORT) => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Server or DB connection error: ", err);
    process.exit(1);
  }
};

module.exports = { startServer };
