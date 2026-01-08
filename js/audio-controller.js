/**
 * AudioController
 * Handles audio playback using Web Audio API for Schulte Grid
 */

var AudioController = (function() {
    var context = null;
    var buffers = {};
    var enabled = true;
    var volume = 0.5; // Default volume 50%

    // Initialize AudioContext
    function init() {
        if (context) return;
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            context = new AudioContext();
        } catch(e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }

    // Load audio file
    function load(key, url) {
        if (!context) init();
        if (!context) return;

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            context.decodeAudioData(request.response, function(buffer) {
                buffers[key] = buffer;
            }, function(e) {
                console.warn('Error decoding audio data for ' + key, e);
            });
        };

        request.onerror = function() {
            console.warn('Error loading audio file: ' + url);
        };

        request.send();
    }

    // Play sound by key
    function play(key) {
        if (!enabled) return;
        
        if (!context) {
            init();
        }

        // Resume context if suspended (browser policy)
        if (context.state === 'suspended') {
            context.resume().then(function() {
                 // optionally log resume
            }).catch(function(e) {
                 console.warn('AudioContext resume failed', e);
            });
        }

        if (!buffers[key]) {
             console.warn('Audio buffer not found for key: ' + key);
             return;
        }

        try {
            var source = context.createBufferSource();
            source.buffer = buffers[key];
            
            var gainNode = context.createGain();
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(context.destination);
            
            source.start(0);
        } catch (e) {
            console.error('Error playing sound', e);
        }
    }

    function resume() {
        if (context && context.state === 'suspended') {
            context.resume();
        }
    }

    return {
        init: init,
        load: load,
        play: play,
        resume: resume,
        setEnabled: function(val) { enabled = !!val; },
        getEnabled: function() { return enabled; },
        setVolume: function(val) { volume = Math.max(0, Math.min(1, val)); }
    };
})();
