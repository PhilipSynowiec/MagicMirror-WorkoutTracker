Module.register("MMM-WorkoutTracker", {
	defaults: {},
	loaded: false,
	showApp: false,

	getStyles () {
		return [this.file("MMM-WorkoutTracker.css")];
	},

	start () {
		this.loaded = true;
		this.showApp = false;
	},

	getDom () {
		const wrapper = document.createElement("div");
		wrapper.className = "workout-tracker-wrapper";

		// Floating button
		if (!this.showApp) {
			const button = document.createElement("button");
			button.className = "workout-fab";
			button.innerHTML = "🏋️";
			button.title = "Open Workout Tracker";
			button.onclick = () => {
				this.showApp = true;
				this.updateDom();
			};
			wrapper.appendChild(button);
		} else {
			// Overlay app
			const overlay = document.createElement("div");
			overlay.className = "workout-overlay";

			const appBox = document.createElement("div");
			appBox.className = "workout-app-box";

			const closeBtn = document.createElement("span");
			closeBtn.className = "workout-close";
			closeBtn.innerHTML = "&times;";
			closeBtn.title = "Close";
			closeBtn.onclick = () => {
				this.showApp = false;
				this.updateDom();
			};
			appBox.appendChild(closeBtn);

			const title = document.createElement("h2");
			title.innerText = "Workout Tracker";
			appBox.appendChild(title);

			const startBtn = document.createElement("button");
			startBtn.className = "workout-start-btn";
			startBtn.innerText = "START WORKOUT";
			// No action for now
			appBox.appendChild(startBtn);

			overlay.appendChild(appBox);
			wrapper.appendChild(overlay);
		}
		return wrapper;
	}
});
