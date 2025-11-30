const generateID = (prefix, number, digit) => {
  const lastNumber = String(number.split("-")[1]);
  const nextNumber = Number(lastNumber) + 1;

  return `${prefix}-${String(nextNumber).padStart(digit, "0")}`;
};

module.exports = { generateID };
