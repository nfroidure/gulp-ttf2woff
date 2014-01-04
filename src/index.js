var es = require('event-stream')
  , gutil = require('gulp-util')
  , BufferStreams = require('bufferstreams')
  , ttf2woff = require('ttf2woff')
;

// File level transform function
function ttf2woffTransform(opt) {
  // Return a callback function handling the buffered content
  return function(err, buf, cb) {

    // Handle any error
    if(err) {
      cb(new gutil.PluginError('ttf2woff', err, {showStack: true}));
    }

    // Use the buffered content
      try {
        buf = new Buffer(ttf2woff(new Uint8Array(buf)).buffer);
        cb(null, buf);
      } catch(err) {
        cb(new gutil.PluginError('ttf2woff', err, {showStack: true}));
      }

  };
}

// Plugin function
function ttf2woffGulp() {

  return es.map(function (file, callback) {
    file.path = gutil.replaceExtension(file.path, ".woff");

    // Buffers
    if(file.isBuffer()) {
      try {
        file.contents = new Buffer(ttf2woff(
          new Uint8Array(file.contents)
        ).buffer);
        callback(null, file);
      } catch(err) {
        callback(new gutil.PluginError('ttf2woff', err, {showStack: true}));
      }

    // Streams
    } else {
      file.contents = file.contents.pipe(new BufferStreams(ttf2woffTransform()));
      callback(null, file);
    }
  });

};

// Export the file level transform function for other plugins usage
ttf2woffGulp.fileTransform = ttf2woffTransform;

// Export the plugin main function
module.exports = ttf2woffGulp;

