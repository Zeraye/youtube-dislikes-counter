const fetchResponse = async (video_id) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "video_id": video_id }),
  };

  const response = await fetch("https://youtube-dislikes-counter.herokuapp.com/dislikes", requestOptions);

  const data = await response.json();

  return `${data["response"]}`
};

const showCounter = async (url) => {
  const video_id = url.match(/v=([^&#]{5,})/)[1]; 
  const response = await fetchResponse(video_id);
  return response;
}

browser.pageAction.onClicked.addListener(async () => {
  await browser.tabs.executeScript({
    code: `document.getElementsByTagName("ytd-toggle-button-renderer")[1].childNodes[0].childNodes[1].textContent = "Loading...";`,
  });

  const [url] = await browser.tabs.executeScript({
    code: `window.location.href;`,
  });

  const counter = await showCounter(url)
  
  await browser.tabs.executeScript({
    code: `document.getElementsByTagName("ytd-toggle-button-renderer")[1].childNodes[0].childNodes[1].textContent = "${counter}";`,
  });

  await browser.tabs.executeScript({
    code: `
      element = document.querySelectorAll('[force-default-style=""]')[1];

      observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          document.getElementsByTagName("ytd-toggle-button-renderer")[1].childNodes[0].childNodes[1].textContent = "Dislike";
        });
      });
      
      observer.observe(element, {
        childList: true
      });
    `,
  });
});