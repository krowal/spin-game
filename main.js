(function()
{
    this.images = {};
    this.symbols = [];

    var s_amount = 0;

    var $ = function(id){
        return document.getElementById(id);
    };

    /**
     * Rendering game objects in canvas element
     */
    var Renderer = new (function(_context)
    {
        var ctx;

        this.draw = function(_game)
        {
            var canvas = _context.DOM.canvas;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            var idx = Math.floor(_game.getSpinPosition() / 155);
            var drawElements = [
                _context.symbols[idx],
                _context.symbols[(idx+1) > (_context.symbols.length-1) ? 0 : (idx+1)]
            ];

            for(var i = 0; i < drawElements.length; i++)
            {
                var offsetTop = i * 155 - _game.getSpinPosition() % 155;
                var img = _context.images[drawElements[i].path];
                ctx.drawImage(img, 0, 0, 235, 155, 0, offsetTop, 235, 155);
            }
        };

        this.init = function(){
            ctx = _context.DOM.canvas.getContext('2d');
        };
    })(this);

    var Game = new (function(_context)
    {
        var spinning = false,
            spinPosition = 0,
            spinStartTime = null,
            spinTarget = null,
            startOffset = 0,
            spinLength = null,
            win = false,
            spinTime = 3000; //time of spin in ms


        this.getSpinPosition = function()
        {
            return spinPosition % (_context.symbols.length * 155);
        };

        this.onChoiceChange = function(e)
        {
            var val = e.target.value;
            this.symbolPreview(val);
        };

        this.onSpinClick = function()
        {
            if(!spinning)
            {
                _context.sound.hit.play();
                _context.DOM.spinButton.classList.add('disabled');
                _context.DOM.choice.select.disabled = true;

                spinTarget = Math.floor((Math.random() * symbols.length));
                win = _context.DOM.choice.select.value == _context.symbols[spinTarget].key;

                this.startSpin();
            }
        };

        this.startSpin = function()
        {
            spinning = true;
            spinStartTime = (new Date()).getTime();
            startOffset = spinPosition % (_context.symbols.length * 155);
            spinLength = (spinTarget * 155) + (3 * (_context.symbols.length * 155)) - startOffset;
            _context.sound.roll.play();
        };

        this.endSpin = function()
        {
            spinning = false;
            _context.DOM.spinButton.classList.remove('disabled');
            _context.DOM.choice.select.disabled = false;

            _context.sound.roll.pause();
            _context.sound.roll.currentTime = 0;
            if(win)
            {
                _context.sound.win.play();
            }else
            {
                _context.sound.lost.play();
            }
        };

        this.symbolPreview = function(symbol)
        {
            var img = _context.symbols.find(function(e){return e.key == symbol}).img;
            _context.DOM.choice.symbol.innerHTML = "";

            _context.DOM.choice.symbol.appendChild(
                img
            );
            img.classList.add("pop-in");
        };

        this.update = function()
        {
            if(!spinning) return false;

            var timePassed = ((new Date()).getTime() - spinStartTime) / spinTime;
            if(timePassed >= 1)
            {
                timePassed = 1;
                this.endSpin();
            }
            spinPosition = startOffset + timePassed * spinLength;
            Renderer.draw(this);

            if(timePassed >= 1) startOffset = spinPosition % (_context.symbols.length * 155);
        };

        this.tick = function(){
            requestAnimationFrame(function(){
                this.tick()
            }.bind(this));

            this.update();
        };

        this.start = function()
        {
            this.symbolPreview(_context.DOM.choice.select.value);
            Renderer.init();

            this.tick();
            Renderer.draw(this);
        };
    })(this);

    var createSound = function(path, loop)
    {
        var sound = document.createElement('audio');
        sound.src = path;
        if(loop) sound.loop = true;

        return sound;
    };

    /**
     * Initializing html elements events listeners,
     * loading config json and images
     * and starting the game engine
     */
    this.init = function()
    {
        this.DOM = {
            overlay: $("overlay"),
            choice: {
                select: $("choice"),
                label: $("choice_label"),
                symbol: $("choice_symbol")
            },
            canvas: $("canvas"),
            spinButton: $("spin_button")
        };

        this.sound = {
            roll: createSound("sound/roll.wav", true),
            hit: createSound("sound/start.wav"),
            win: createSound("sound/win.wav"),
            lost: createSound("sound/lost.wav")
        };

        this.DOM.choice.select.addEventListener('change', Game.onChoiceChange.bind(Game));
        this.DOM.spinButton.addEventListener('click', Game.onSpinClick.bind(Game));

        var fillOptions = function(options)
        {
            var choiceNode = this.DOM.choice.select;
            for(var i in options)
            {
                var opt = options[i];
                var option = document.createElement("option");
                option.value        = opt.key;
                option.innerHTML    = opt.name;
                choiceNode.appendChild(option);
            }
        }.bind(this);

        var fetchImages = function(list, onLoadCallback)
        {
            var amountToLoad = 0;
            for(var i in list)
            {
                amountToLoad++;
                var img = new Image();
                img.onload = function()
                {
                    amountToLoad--;
                    if(amountToLoad == 0)
                        onLoadCallback();
                };
                img.src = "img/" + list[i];
                this.images[list[i]] = img;
            }
        }.bind(this);

        var loadJSON = function(path, callback)
        {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function()
            {
                if (xhr.readyState === XMLHttpRequest.DONE)
                {
                    if (xhr.status === 200)
                        callback(JSON.parse(xhr.responseText));
                    else
                        throw "Error while trying to fetch json file [" + path + "]";
                }
            };
            xhr.open("GET", path, true);
            xhr.send();
        };

        var initSymbols = function(list)
        {
            s_amount = list.length;
            for(var i=0; i < list.length; i++)
            {
                var symbol = list[i];
                symbol.img = this.images[symbol.path];
                this.symbols.push(symbol);
            }

            fillOptions(this.symbols);
        }.bind(this);

        loadJSON("images.json", function(data)
        {
            fetchImages(data.images, function(){
                initSymbols(data.symbols);

                this.DOM.overlay.className += " fading-out";
                setTimeout(function(){
                    this.DOM.overlay.style.display = "none";
                }.bind(this), 500);

                Game.start();
            }.bind(this));
        });
    };

    /**
     * Starting initialisation process
     * when whole document is ready
     */
    if(document.readyState === "complete")
        this.init();
    else
        window.addEventListener("load", function ()
        {
            this.init();
        }.bind(this), false);
})();


