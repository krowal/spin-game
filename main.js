(function()
{
    var Renderer = new (function(_context)
    {

    })(this);

    var Game = new (function(_context)
    {
        this.start = function()
        {
            console.log(_context.elements.choice.value);
        }
    })(this);

    this.init = function()
    {
        this.elements = {
            overlay:    document.getElementById("overlay"),
            choice:     document.getElementById("choice"),
            canvas:     document.getElementById("canvas"),
            spinButton: document.getElementById("spinButton")
        };

        var fillOptions = function(options)
        {
            var choiceNode = this.elements.choice;
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
            this.symbols = list;
            fillOptions(this.symbols);
            fetchImages(this.symbols, function()
            {
                this.elements.overlay.className += " fading-out";
                setTimeout(function(){
                    this.elements.overlay.style.display = "none";
                }.bind(this), 500);
                //this.elements.overlay.style.display = "none";
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

