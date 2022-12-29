function loadJs(url) {
  if (!url.startsWith('https://raw.githubusercontent.com/slorf/')) {
    throw new Error('invalid source url');
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      const xhr = e.target;
      try {
        const js = xhr.response;
        new Function(js)();
        resolve();
      } catch(e) {
        reject(e);
      }
    });
    xhr.addEventListener('error', reject);
    xhr.open("GET", url);
    xhr.send();
  });
}
