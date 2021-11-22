window.onload = async (event) => {
	const cache = (await browser.storage.local.get()) || {};

	if (cache["counter"])
		document.getElementById("counter").textContent = cache["counter"];
	else {
		await browser.storage.local.set({ "counter": 100});
		document.getElementById("counter").textContent = 100;
	}

	if (cache["api_key"])
		document.getElementById("api_key").value = cache["api_key"];
};

const validate_api_key = async (api_key) => {
	// TODO validate api key
	if (api_key[0] === "a")
		return false;
	return true;
}

document.getElementById("save").addEventListener("click", async (event) => {
	const api_key = document.getElementById("api_key").value;
	const valid = await validate_api_key(api_key);
	
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

