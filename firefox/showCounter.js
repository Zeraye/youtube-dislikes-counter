const initializeLocalStorage = async () => {
  const cache = (await browser.storage.local.get()) || {};

  if (!cache["counter"])
    await browser.storage.local.set({ "counter": 999 });

  if (!cache["api_key"])
    await browser.storage.local.set({ "api_key": "" });

  if (!cache["day"] || !cache["month"] || !cache["year"]) {
    const currentDate = new Date();
    await browser.storage.local.set({ "day": currentDate.getDate() });
    await browser.storage.local.set({ "month": currentDate.getMonth() });
    await browser.storage.local.set({ "year": currentDate.getFullYear() });
  }
}

initializeLocalStorage();

const resetCounterOnDateChange = async () => {
  const cache = (await browser.storage.local.get()) || {};

  const currentDate = new Date();

  if (cache["day"] !== currentDate.getDate() || cache["month"] !== currentDate.getMonth() || cache["year"] !== currentDate.getFullYear()) {
    await browser.storage.local.set({ "counter": 999 });
		await browser.storage.local.set({ "day": currentDate.getDate() });
		await browser.storage.local.set({ "month": currentDate.getMonth() });
		await browser.storage.local.set({ "year": currentDate.getFullYear() });
	}
}

const fetchResponse = async (video_id) => {
  await resetCounterOnDateChange();

  const cache = (await browser.storage.local.get()) || {};

  if (cache["api_key"] === "")
    if (cache["counter"] === 0)
      return "Daily limit";
    
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "video_id": video_id, "api_key": cache["api_key"] }),
  };

  const response = await fetch("https://youtube-dislikes-counter.herokuapp.com/dislikes", requestOptions);

  if (response.status === 200) {
    if (cache["api_key"] === "")
      await browser.storage.local.set({ "counter": cache["counter"]-1 });
  }

  const data = await response.json();

  return `${data["response"]}`
};

const showCounter = async (url) => {
  const video_id = url.match(/v=([^&#]{5,})/)[1];

  const response = await fetchResponse(video_id);

  return response;
}

const dislikesCounterElement = `document.querySelectorAll("#info #menu ytd-toggle-button-renderer yt-formatted-string")[1]`;

browser.pageAction.onClicked.addListener(async () => {
  const [oldDislikesCounterValue] = await browser.tabs.executeScript({
    code: `${dislikesCounterElement}.textContent;`,
  });

  await browser.tabs.executeScript({
    code: `${dislikesCounterElement}.textContent = "Loading...";`,
  });

  const [url] = await browser.tabs.executeScript({
    code: `window.location.href;`,
  });

  const counter = await showCounter(url);
  
  await browser.tabs.executeScript({
    code: `${dislikesCounterElement}.textContent = "${counter}";`,
  });

  await browser.tabs.executeScript({
    code: `
      element = document.querySelector("#info .title yt-formatted-string");

      observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          ${dislikesCounterElement}.textContent = "${oldDislikesCounterValue}";
        });
      });
      
      observer.observe(element, {
        childList: true
      });
    `,
  });
});
