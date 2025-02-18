/* eslint-disable no-console */

const testConfig = require('./src/test/e2e/config');
const supportedBrowsers = require('./src/test/e2e/crossbrowser/supportedBrowsers.js');
const testUserConfig = require('./src/test/config.js').config;

const waitForTimeout = parseInt(process.env.WAIT_FOR_TIMEOUT) || 30000;
const smartWait = parseInt(process.env.SMART_WAIT) || 30000;
const browser = process.env.SAUCELABS_BROWSER || 'chrome';
const defaultSauceOptions = {
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  //tunnelIdentifier: process.env.TUNNEL_IDENTIFIER || 'reformtunnel',
  acceptSslCerts: true,
  tags: ['DSS WEB'],
  maxDuration: 3000,
};

function merge(intoObject, fromObject) {
  return Object.assign({}, intoObject, fromObject);
}

function getBrowserConfig(browserGroup) {
  const browserConfig = [];
  for (const candidateBrowser in supportedBrowsers[browserGroup]) {
    if (candidateBrowser) {
      const candidateCapabilities = supportedBrowsers[browserGroup][candidateBrowser];
      candidateCapabilities['sauce:options'] = merge(defaultSauceOptions, candidateCapabilities['sauce:options']);
      browserConfig.push({
        browser: candidateCapabilities.browserName,
        capabilities: candidateCapabilities,
      });
    } else {
      console.error('ERROR: supportedBrowsers.js is empty or incorrectly defined');
    }
  }
  return browserConfig;
}

const setupConfig = {
  tests: './src/test/e2e/tests/*_test.js',
  teardown: testUserConfig.teardown,
  output: `${process.cwd()}/${testConfig.TestOutputDir}`,
  helpers: {
    WebDriver: {
      url: testConfig.baseUrl,
      keepCookies: true,
      browser,
      smartWait,
      waitForTimeout,
      cssSelectorsEnabled: 'true',
      host: 'ondemand.eu-central-1.saucelabs.com',
      port: 80,
      region: 'eu',
      capabilities: {},
    },
    SauceLabsReportingHelper: {
      require: './src/test/e2e/helpers/SauceLabsReportingHelper.js',
    },
    HooksHelper: {
      require: './src/test/e2e/helpers/hooks_helper.js',
    },
    BrowserHelpers: {
      require: './src/test/e2e/helpers/browser_helper.js',
    },
    DumpBrowserLogsHelper: {
      require: './src/test/e2e/helpers/dump_browser_logs_helper.js',
    },
    StepListener: {
      require: './src/test/e2e/helpers/stepListener.js',
    },
    Mochawesome: {
      uniqueScreenshotNames: true,
    },
  },
  plugins: {
    autoLogin: testUserConfig.AutoLogin,
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
    autoDelay: {
      enabled: true,
      delayAfter: 1000,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
  include: {
    config: './src/test/e2e/config.js',
    I: './src/test/e2e/actors/main.js',
    landingPage: './src/test/e2e/pages/LandingPage.js',
    loginPage: './src/test/e2e/pages/login.page.js',

  },
  mocha: {
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: { steps: true },
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: { mochaFile: `${testConfig.TestOutputDir}/result.xml` },
      },
      mochawesome: {
        stdout: testConfig.TestOutputDir + '/console.log',
        options: {
          reportDir: testConfig.TestOutputDir,
          reportName: 'index',
          reportTitle: 'Crossbrowser results',
          inlineAssets: true,
        },
      },
    },
  },
  multiple: {
    microsoft: {
      browsers: getBrowserConfig('microsoft'),
    },
    chrome: {
      browsers: getBrowserConfig('chrome'),
    },
    firefox: {
      browsers: getBrowserConfig('firefox'),
    },
  },
  name: 'Sptribs FrontEnd Cross-Browser Tests',
};

exports.config = setupConfig;
