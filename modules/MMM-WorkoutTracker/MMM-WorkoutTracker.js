Module.register("MMM-WorkoutTracker", {
  defaults: {
    position: "bottom_right",
    buttonSize: "60px",
    buttonColor: "#333",
    buttonHoverColor: "#555",
    textColor: "#fff",
    fontSize: "16px",
    repLogBackground: "rgba(0, 0, 0, 0.7)",
    repLogColor: "#fff",
    repLogFontSize: "18px"
  },

  loaded: false,
  showApp: false,
  showWorkoutMenu: false,
  showWorkoutSession: false,
  currentExercise: null,
  currentRepCount: 0,
  targetReps: 0,
  isCountingUp: false,
  workoutActive: false,
  repLog: [],
  repCount: 0,
  lastRepTime: null,
  exerciseTotals: {},

  getStyles: function () {
    return [this.file("MMM-WorkoutTracker.css")];
  },

  start: function () {
    this.loaded = true;
    this.showApp = false;
    this.showWorkoutMenu = false;
    this.showWorkoutSession = false;
    this.currentExercise = null;
    this.currentRepCount = 0;
    this.targetReps = 0;
    this.isCountingUp = false;
    this.workoutActive = false;
    this.repLog = [];
    this.repCount = 0;
    this.lastRepTime = null;
    this.exerciseTotals = {};
    
    // Start rep detection simulation
    this.startRepDetection();
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "workout-tracker-wrapper";

    if (!this.workoutActive) {
      // Show floating button
      const button = document.createElement("div");
      button.className = "workout-button";
      button.innerHTML = "💪";
      button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: ${this.config.buttonSize};
        height: ${this.config.buttonSize};
        background-color: ${this.config.buttonColor};
        color: ${this.config.textColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${this.config.fontSize};
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
      `;
      
      button.addEventListener("click", () => {
        this.workoutActive = true;
        this.repLog = [];
        this.currentExercise = null;
        this.currentRepCount = 0;
        this.targetReps = 0;
        this.isCountingUp = false;
        this.updateDom();
      });
      
      wrapper.appendChild(button);
    } else {
      // Show full-screen workout interface
      const overlay = document.createElement("div");
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: transparent;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      `;

      // Rep log in top left
      const repLogContainer = document.createElement("div");
      repLogContainer.className = "rep-log-container";
      repLogContainer.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        background: ${this.config.repLogBackground};
        color: ${this.config.repLogColor};
        padding: 15px;
        border-radius: 10px;
        max-width: 300px;
        font-size: ${this.config.repLogFontSize};
        backdrop-filter: blur(10px);
      `;

      const repLogTitle = document.createElement("div");
      repLogTitle.innerHTML = "<strong>WORKOUT LOG</strong>";
      repLogTitle.style.marginBottom = "10px";
      repLogContainer.appendChild(repLogTitle);

      const repLogContent = document.createElement("div");
      repLogContent.className = "rep-log-content";
      
      if (this.repLog.length === 0) {
        repLogContent.innerHTML = "<em>AI will detect and log your reps automatically...</em>";
      } else {
        this.repLog.forEach(entry => {
          const logEntry = document.createElement("div");
          logEntry.style.marginBottom = "5px";
          if (entry.isCounting) {
            logEntry.innerHTML = `<span style="color: #FFD700;">${entry.exercise}: ${entry.currentRep}...</span>`;
          } else {
            logEntry.innerHTML = `<span style="color: #4CAF50;">${entry.exercise}: ${entry.finalReps} reps</span>`;
          }
          repLogContent.appendChild(logEntry);
        });
      }
      
      repLogContainer.appendChild(repLogContent);

      // Close button in top right
      const closeButton = document.createElement("div");
      closeButton.innerHTML = "✕";
      closeButton.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background-color: rgba(255, 0, 0, 0.8);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 18px;
        z-index: 10000;
      `;
      
      closeButton.addEventListener("click", () => {
        this.workoutActive = false;
        this.repLog = [];
        this.currentExercise = null;
        this.currentRepCount = 0;
        this.targetReps = 0;
        this.isCountingUp = false;
        this.updateDom();
      });

      overlay.appendChild(repLogContainer);
      overlay.appendChild(closeButton);
      wrapper.appendChild(overlay);
    }

    return wrapper;
  },

  showMenu() {
    const menuOverlay = document.createElement("div");
    menuOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const menuContainer = document.createElement("div");
    menuContainer.style.cssText = `
      background: rgba(0, 0, 0, 0.9);
      padding: 40px;
      border-radius: 15px;
      text-align: center;
      backdrop-filter: blur(10px);
    `;

    const title = document.createElement("h2");
    title.innerHTML = "💪 WORKOUT TRACKER";
    title.style.cssText = `
      color: white;
      margin-bottom: 30px;
      font-size: 24px;
    `;

    const startButton = document.createElement("button");
    startButton.innerHTML = "START WORKOUT";
    startButton.style.cssText = `
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      margin: 10px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: background 0.3s;
    `;
    
    startButton.addEventListener("mouseenter", () => {
      startButton.style.background = "#45a049";
    });
    
    startButton.addEventListener("mouseleave", () => {
      startButton.style.background = "#4CAF50";
    });

    const historyButton = document.createElement("button");
    historyButton.innerHTML = "WORKOUT HISTORY";
    historyButton.style.cssText = `
      background: #2196F3;
      color: white;
      border: none;
      padding: 15px 30px;
      margin: 10px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: background 0.3s;
    `;
    
    historyButton.addEventListener("mouseenter", () => {
      historyButton.style.background = "#1976D2";
    });
    
    historyButton.addEventListener("mouseleave", () => {
      historyButton.style.background = "#2196F3";
    });

    const closeMenuButton = document.createElement("button");
    closeMenuButton.innerHTML = "✕";
    closeMenuButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
    `;

    startButton.addEventListener("click", () => {
      this.workoutActive = true;
      this.repLog = [];
      this.exerciseTotals = {};
      this.updateDom();
    });

    historyButton.addEventListener("click", () => {
      alert("Workout history feature coming soon!");
    });

    closeMenuButton.addEventListener("click", () => {
      document.body.removeChild(menuOverlay);
    });

    menuContainer.appendChild(title);
    menuContainer.appendChild(startButton);
    menuContainer.appendChild(historyButton);
    menuOverlay.appendChild(closeMenuButton);
    menuOverlay.appendChild(menuContainer);
    document.body.appendChild(menuOverlay);
  },

  startRepDetection() {
    setInterval(() => {
      if (this.workoutActive) {
        if (!this.isCountingUp) {
          // Start a new exercise set
          const exercises = ["Push-ups", "Pull-ups", "Squats", "Lunges", "Burpees", "Planks"];
          this.currentExercise = exercises[Math.floor(Math.random() * exercises.length)];
          this.targetReps = Math.floor(Math.random() * 15) + 5; // 5-20 reps
          this.currentRepCount = 1;
          this.isCountingUp = true;
          
          // Add to log as counting
          this.repLog.push({
            exercise: this.currentExercise,
            currentRep: 1,
            finalReps: this.targetReps,
            isCounting: true
          });
        } else {
          // Continue counting up
          this.currentRepCount++;
          
          // Update the last entry
          const lastEntry = this.repLog[this.repLog.length - 1];
          lastEntry.currentRep = this.currentRepCount;
          
          if (this.currentRepCount >= this.targetReps) {
            // Finished the set
            lastEntry.isCounting = false;
            this.isCountingUp = false;
          }
        }
        
        this.updateDom();
      }
    }, 800 + Math.random() * 400); // Random interval between 0.8-1.2 seconds for realistic counting
  }
});
