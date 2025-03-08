Module.register("MMM-CookingTimer", {
    defaults: {
        width: "100%%",
        height: "100%",
        volume: 100,
        timers: [],
        suspended: false,
    },

    getStyles: function () {
        return ["MMM-CookingTimer.css"]
    },

    start: function () {
        this.suspended = false;
        this.lastUpdateTime = Date.now();
        this.loadHowler();
    },

    loadHowler: function() {
        var script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js";
        script.onload = () => {
            this.howlerLoaded = true;
        };
        document.head.appendChild(script);
    },

    getCommands: function (commander) {

    },

    repeatEverySecond: function () {
        if (!this.suspended) {
            const now = Date.now();
            const elapsed = now - this.lastUpdateTime;
            if (elapsed >= 1000) {
                this.updateTimers();
                this.lastUpdateTime = now - (elapsed % 1000);
            }
            setTimeout(this.repeatEverySecond.bind(this), 1000 - (elapsed % 1000));
        }
    },
    


    getDom: function () {
        var dom = document.createElement("div")
        dom.id = "COOKING_TIMERS"
        dom.style.width = this.config.width
        dom.style.height = this.config.height
        dom.innerText = "COOKING TIMERS"
        return dom
    },

    addTimer: function(name, title, timeInSeconds){
        let timerObject = {name: name, timeInSeconds: timeInSeconds, title: title};
        this.config.timers.push(timerObject);
        this.addTimerToDom(timerObject);
    },

    formatTime: function(timeInSeconds){
        var hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0')
        var minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0')
        var seconds = String(timeInSeconds % 60).padStart(2, '0')
        return hours + ":" + minutes + ":" + seconds
    },

    addTimerToDom: function(timerObject){
        var dom = document.getElementById("COOKING_TIMERS")
        var timer = document.createElement("div")
        timer.className = "TIMER"
        timer.id = "timer-"+timerObject.name
        timer.innerText = timerObject.title
        // Add countdown
        var countdown = document.createElement("div")
        countdown.className = "COUNTDOWN"

        // convert timeInsSeconds to hours minutes and seconds
        countdown.innerText = this.formatTime(timerObject.timeInSeconds)
        timer.appendChild(countdown)   
        dom.appendChild(timer)
    },

    updateTimers: function(){
        var timers = document.getElementsByClassName("TIMER")
        // repeat over all timers in the config object
        for (var i = 0; i < this.config.timers.length; i++){
            var timerObject = this.config.timers[i];
            var timerHtml = document.getElementById("timer-" + timerObject.name)
            timerObject.timeInSeconds -= 1;
            // if() timer has reached 0, play sound and remove timer
            if(timerObject.timeInSeconds <= 0){ 
                this.completTimer(timerHtml, timerObject);

            } else {
                // update timer in the DOM
                this.updateDomCountDown(timerHtml, timerObject);
            }
        }
    },

    completTimer: function(timerHtml, timerObject){
        var sound = new Howl({
            src: ["modules/MMM-CookingTimer/alarm-301729.mp3"]
        });
        sound.play();
        // stop after 3 seconds
        setTimeout(() => {
            sound.stop();
        }, 3000);
        timerHtml.remove();
        this.config.timers.splice(i, 1);
    },

    updateDomCountDown: function(timerHtml, timerObject){
            var countdown = timerHtml.getElementsByClassName("COUNTDOWN")[0]
            countdown.innerText = this.formatTime(timerObject.timeInSeconds)   
    },

    suspend: function () {
        this.suspended = true
    },

    resume: function () {
        this.suspended = false
        this.lastUpdateTime = Date.now();
        this.repeatEverySecond();
    },

    notificationReceived: function (noti, payload) {
        if (noti == "DOM_OBJECTS_CREATED") {
            this.prepare()
        }
        if (noti == "COOKING_TIMER_ADD") {
            this.addTimer(payload.name, payload.title, payload.timeInSeconds)
        }        
    },

   
    prepare: function () {

    },
})
