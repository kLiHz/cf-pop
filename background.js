var browser = browser || chrome;

const getIconImageData = (canvasSize, data, shiftX, shiftY) => {
  const size = canvasSize < 128 ? canvasSize : 128;
  const f = size / canvasSize;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.scale(f, f);
  ctx.setTransform(f, 0, 0, f, shiftX, shiftY)
  data.forEach((i) => {
    ctx.fillStyle = i.fill;
    ctx.fill(new Path2D(i.path));
  });
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return ctx.getImageData(0, 0, size, size);
}

const colorStrToGray = (s) => {
  const t = s.slice(1);
  const parseHex = x => parseInt(x, 16);
  const r = parseHex(t.slice(0,2));
  const g = parseHex(t.slice(2,4));
  const b = parseHex(t.slice(4,6));
  let h = 0.299 * r + 0.587 * g + 0.114 * b;
  const f = h.toFixed(0);
  return '#' + (f | f << 8 | f << 16).toString(16);
}

const lightIconData = [
  {fill: "#ffffff", path: "m312.2 184.55-42.9-24.6-7.4-3.2-175.5 1.2v89.1h225.8z"},
  {fill: "#f38020", path: "m234.1 238.85c2.1-7.2 1.3-13.8-2.2-18.7-3.2-4.5-8.6-7.1-15.1-7.4l-123.1-1.6a2.28 2.28 0 0 1-1.9-1 2.76 2.76 0 0 1-0.3-2.2 3.38 3.38 0 0 1 2.9-2.2l124.2-1.6c14.7-0.7 30.7-12.6 36.3-27.2l7.1-18.5a4 4 0 0 0 0.2-2.4 80.87 80.87 0 0 0-155.5-8.3 36.35 36.35 0 0 0-58 25.4 38.18 38.18 0 0 0 0.9 12.7 51.66 51.66 0 0 0-50.2 51.7 63 63 0 0 0 0.5 7.5 2.46 2.46 0 0 0 2.4 2.1h227.2a3.09 3.09 0 0 0 2.9-2.2z"},
  {fill: "#faae40", path: "m273.3 159.75c-1.1 0-2.3 0-3.4 0.1a2 2 0 0 0-1.8 1.4l-4.8 16.7c-2.1 7.2-1.3 13.8 2.2 18.7 3.2 4.5 8.6 7.1 15.1 7.4l26.2 1.6a2.28 2.28 0 0 1 1.9 1 2.82 2.82 0 0 1 0.3 2.2 3.38 3.38 0 0 1-2.9 2.2l-27.3 1.6c-14.8 0.7-30.7 12.6-36.3 27.2l-2 5.1a1.44 1.44 0 0 0 1.4 2h93.8a2.46 2.46 0 0 0 2.4-1.8 68.35 68.35 0 0 0 2.5-18.2 67.37 67.37 0 0 0-67.3-67.2"},
]

const grayIconData = lightIconData.map(i => {
  return {
    fill: colorStrToGray(i.fill), 
    path: i.path
  };
});

const lightImageData = getIconImageData(340, lightIconData, 0, -32)
const grayImageData = getIconImageData(340, grayIconData);

// we need to use onCompleted because badget text is reset on navigation

browser.webRequest.onCompleted.addListener(
  (details) => {
    const tabid = details.tabId;
    if (tabid === -1) { return; }
  
    const h = details.responseHeaders.find(header => header.name.toLowerCase() === 'cf-ray');
    if (!h) return;
    const s = h.value;
    const l = s.split('-');
    const pop = l[l.length - 1];
  
    if (pop.length > 0) {
      browser.action.setBadgeText({
        text: pop, tabId: tabid,
      })
      browser.action.setIcon({
        imageData: lightImageData,
        tabId: tabid,
      })
      const title = browser.i18n.getMessage(
        'title', browser.i18n.getMessage(pop),
      )
      browser.action.setTitle({
        title: title, tabId: tabid,
      })
    }
  },
  {urls: ['<all_urls>'], types: ['main_frame']},
  ['responseHeaders'],
)

browser.action.setBadgeBackgroundColor({
  color: 'rgba(243, 128, 32, 0.5)',
})
browser.action.setBadgeTextColor({
  color: '#fff',
})

browser.action.setIcon({
  imageData: grayImageData,
});
