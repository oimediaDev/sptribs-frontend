const LATEST_MAC = 'macOS 11.00';
const LATEST_WINDOWS = 'Windows 10';

const supportedBrowsers = {
  microsoft: {
    edge_win_latest: {
      browserName: 'MicrosoftEdge',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: Edge_Win10',
        screenResolution: '1400x1050',
      },
    },
  },
  webkit: {
    webkit_latest: {
      browserName: 'webkit',
      platformName: LATEST_MAC,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: Webkit_MAC',
        screenResolution: '1400x1050',
      },
    },
  },
  safari: {
    safari_mac_latest: {
      browserName: 'safari',
      platformName: LATEST_MAC,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: MAC_SAFARI',
        seleniumVersion: '3.141.59',
        screenResolution: '1376x1032',
      },
    },
  },
  chrome: {
    chrome_win_latest: {
      browserName: 'chrome',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: WIN_CHROME_LATEST',
        screenResolution: '1600x1200',
      },
    },
    chrome_mac_latest: {
      browserName: 'chrome',
      platformName: LATEST_MAC,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: MAC_CHROME_LATEST',
        screenResolution: '1600x1200',
      },
    },
  },
  firefox: {
    firefox_win_latest: {
      browserName: 'firefox',
      platformName: LATEST_WINDOWS,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: WIN_FIREFOX_LATEST',
        screenResolution: '1600x1200',
      },
    },
    firefox_mac_latest: {
      browserName: 'firefox',
      platformName: LATEST_MAC,
      browserVersion: 'latest',
      'sauce:options': {
        name: 'SPTRIBS: MAC_FIREFOX_LATEST',
        screenResolution: '1600x1200',
      },
    },
  },
};

module.exports = supportedBrowsers;
