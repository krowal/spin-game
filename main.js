(function()
{
    this.symbols = {};

    var $ = function(id){
        return document.getElementById(id);
    };

    var Renderer = new (function(_context)
    {

    })(this);

    var Game = new (function(_context)
    {
        this.onChoiceChange = function(c)
        {
            var val = c.target.value;
            var img = _context.symbols[val].img;
            _context.DOM.choice.symbol.innerHTML = "";

            _context.DOM.choice.symbol.appendChild(
                img
            );

            img.classList.add("pop-in");
        };

        this.start = function()
        {
            console.log(_context.DOM.choice.select.value);
        };
    })(this);

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
            spinButton: $("spinButton")
        };

        this.DOM.choice.select.addEventListener('change', Game.onChoiceChange);

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
                var symbol = list[i];
                amountToLoad++;
                var img = new Image();
                img.onload = function()
                {
                    amountToLoad--;
                    if(amountToLoad == 0)
                        onLoadCallback();
                };
                img.src = "img/" + symbol.key + ".png";
                symbol.img = img;
            }
        };

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
                this.symbols[list[i].key] = list[i];
            }

            fillOptions(this.symbols);
            fetchImages(this.symbols, function()
            {
                this.DOM.overlay.className += " fading-out";
                setTimeout(function(){
                    this.DOM.overlay.style.display = "none";
                }.bind(this), 500);
                Game.start();
            }.bind(this));
        }.bind(this);

        loadJSON("images.json", function(data)
        {
            if(data.symbols)
                initSymbols(data.symbols);
        });
    };

    /**
     * Initializing everything only
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


