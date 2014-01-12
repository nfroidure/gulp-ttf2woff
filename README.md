# gulp-ttf2woff [![NPM version](https://badge.fury.io/js/gulp-ttf2woff.png)](https://npmjs.org/package/gulp-ttf2woff) [![Build status](https://secure.travis-ci.org/nfroidure/gulp-ttf2woff.png)](https://travis-ci.org/nfroidure/gulp-ttf2woff)
> Create a WOFF font from a TTF font with [Gulp](http://gulpjs.com/).

## Usage

First, install `gulp-ttf2woff` as a development dependency:

```shell
npm install --save-dev gulp-ttf2woff
```

Then, add it to your `gulpfile.js`:

```javascript
var ttf2woff = require('gulp-ttf2woff');

gulp.task('ttf2woff', function(){
  gulp.src(['fonts/*.ttf'])
    .pipe(ttf2woff())
    .pipe(gulp.dest('fonts/'));
});
```

## API

### ttf2woff(options)

#### options.ignoreExt
Type: `Boolean`
Default value: `false`

Set to true to also convert files that doesn't have the .ttf extension.

#### options.clone
Type: `Boolean`
Default value: `false`

Set to true to clone the file before converting him so that it will output the
 original file too.

### Contributing / Issues

Please submit TTF to WOFF related issues to the
 [ttf2woff project](https://github.com/fontello/ttf2woff)
 on wich gulp-ttf2woff is built.

This repository issues is only for gulp and gulp tasks related issues.

You may want to contribute to this project, pull requests are welcome if you
 accept to publish under the MIT licence.
