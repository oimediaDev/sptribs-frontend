module.exports = {
  citizenUserOne: {
    email: process.env.CITIZEN_USERNAME,
    password: process.env.CITIZEN_PASSWORD,
  },

  baseUrl: process.env.DS_UI_URL || 'https://sptribs-frontend-staging.service.core-compute-aat.internal',

  definition: {
    jurisdiction: 'PUBLICLAW',
    jurisdictionFullDesc: 'Public Law',
    caseType: 'CARE_SUPERVISION_EPO',
    caseTypeFullDesc: 'Care, supervision and EPOs',
  },
  // files
  testFile: './src/test/e2e/fixtures/testFiles/mockFile.txt',
  testPdfFile: './src/test/e2e/fixtures/testFiles/mockFile.pdf',
  testWordFile: './src/test/e2e/fixtures/testFiles/mockFile.docx',
};
