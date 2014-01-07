'use strict';

var gulp = require('gulp')
  , assert = require('assert')
  , es = require('event-stream')
  , fs = require('fs')
  , ttf2woff = require(__dirname + '/../src/index.js')
;

// Erasing date to get an invariant created and modified font date
// See: https://github.com/fontello/ttf2woff/blob/c6de4bd45d50afc6217e150dbc69f1cd3280f8fe/lib/sfnt.js#L19
Date = (function(d) {
  function Date() {
    d.call(this, 3600);
  }
  Date.now = d.now;
  return Date;
})(Date);

describe('gulp-ttf2woff conversion', function() {
  var filename = __dirname + '/fixtures/iconsfont';
  var woff = fs.readFileSync(filename + '.woff');

  it('should work in buffer mode', function(done) {

      gulp.src(filename + '.ttf')
        .pipe(ttf2woff())
        // Uncomment to regenerate the test files if changes in the ttf2woff lib
        // .pipe(gulp.dest(__dirname + '/fixtures/'))
        .pipe(es.through(function(file) {
          assert.equal(file.contents.length, woff.length);
          assert.equal(file.contents.toString('utf-8'), woff.toString('utf-8'));
        }, function() {
            done();
        }));

  });

  it('should work in stream mode', function(done) {

      gulp.src(filename + '.ttf', {buffer: false})
        .pipe(ttf2woff())
        .pipe(es.through(function(file) {
          // Get the buffer to compare results
          file.contents.pipe(es.wait(function(err, data) {
            assert.equal(data.length, woff.toString('utf-8').length);
            assert.equal(data, woff.toString('utf-8'));
          }));
        }, function() {
            done();
        }));

  });

});
