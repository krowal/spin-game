(function()
{
    this.symbols = {};
    this.images = {};

    var $ = function(id){
        return document.getElementById(id);
    };

    var Renderer = new (function(_context)
    {
        var ctx;

        this.draw = function()
        {
            ctx.drawImage(_context.images["SYM1.png"], 0, 0);
        };

        this.init = function(){
            ctx = _context.DOM.canvas.getContext('2d');
        };
    })(this);

    var Game = new (function(_context)
    {
        var spinning = false;

        this.onChoiceChange = function(e)
        {
            var val = e.target.value;
            this.symbolPreview(val);
        };

        this.onSpinClick = function()
        {
            //TODO:start spin
            if(!spinning)
            {
                _context.DOM.spinButton.classList.add('disabled');
                _context.DOM.choice.select.disabled = true;
                spinning = true;

                this.startSpin();
            }
        };

        this.startSpin = function()
        {

        };

        this.endSpin = function()
        {

        };

        this.symbolPreview = function(symbol)
        {
            var img = _context.symbols[symbol].img;
            _context.DOM.choice.symbol.innerHTML = "";

            _context.DOM.choice.symbol.appendChild(
                img
            );
            img.classList.add("pop-in");
        };

        this.getCurrentChoice = function()
        {
            return _context.symbols[_context.DOM.choice.select.value];
        };

        this.update = function(dt)
        {

            Renderer.draw();
        };

        var then = new Date(),
            now = new Date(),
            delta;

        this.tick = function(){
            requestAnimationFrame(this.tick);

            delta = now.getTime() - then.getTime();
            then = now;
            now = new Date();

            this.update();
        };

        this.start = function()
        {
            this.symbolPreview(_context.DOM.choice.select.value);
            Renderer.init();

            this.tick();
        };
    })(this);


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

        this.DOM.choice.select.addEventListener('change', Game.onChoiceChange.bind(Game));
        this.DOM.spinButton.addEventListener('touchstart', Game.onSpinClick.bind(Game));

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
            console.log(this.images)
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
            for(var i=0; i < list.length; i++)
            {
                var symbol = list[i];
                symbol.img = this.images[symbol.path];
                this.symbols[list[i].key] = symbol;
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


