async function parseIdCardImage(file) {
  console.log("parseIdCardImage mock:", file);
  return {
    name: "王小明",
    idNumber: "A123456789",
    birthday: "1990-01-01"
  };
}

async function parseBankCoverImage(file) {
  console.log("parseBankCoverImage mock:", file);
  return {
    bank: "822 中國信託",
    accountName: "王小明",
    accountNumber: "123456789012"
  };
}

async function parseIphoneScreenshot(file) {
  console.log("parseIphoneScreenshot mock:", file);
  return {
    model: "iPhone 14",
    osVersion: "iOS 17.0"
  };
}
