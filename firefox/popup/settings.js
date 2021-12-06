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

window.onload = async (event) => {
	await resetCounterOnDateChange();

	const cache = (await browser.storage.local.get()) || {};

	if (cache["api_key"] === "")
		document.getElementById("counter").textContent = cache["counter"];
	else
		document.getElementById("counter").textContent = "unlimited";

	document.getElementById("api_key").value = cache["api_key"];
};

const fetchResponse = async (api_key) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "api_key": api_key }),
  };

  const response = await fetch("https://youtube-dislikes-counter.herokuapp.com/validate", requestOptions);

  const data = await response.json();

  return `${data["response"]}`
};

const validateApiKey = async (api_key) => {
	const response = await fetchResponse(api_key);
	if (response === "ok")
		return true;
	return false;
}

document.getElementById("save").addEventListener("click", async (event) => {
	const api_key = document.getElementById("api_key").value;
	const valid = await validateApiKey(api_key);
	
	if (valid) {
		document.getElementById("valid").removeAttribute("hidden");
		if (!document.getElementById("invalid").hidden)
			document.getElementById("invalid").setAttribute("hidden", "");
		await browser.storage.local.set({ "api_key": api_key });
	}
	else {
		document.getElementById("invalid").removeAttribute("hidden");
		if (!document.getElementById("valid").hidden)
			document.getElementById("valid").setAttribute("hidden", "");
		await browser.storage.local.set({ "api_key": "" });
	}
});

