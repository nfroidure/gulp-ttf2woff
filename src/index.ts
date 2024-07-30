import { extname } from 'node:path';
import { Transform, type Readable } from 'node:stream';
import { BufferStream } from 'bufferstreams';
import type Vinyl from 'vinyl';
import ttf2woff from 'ttf2woff';
import PluginError from 'plugin-error';
import replaceExtension from 'replace-ext';

const PLUGIN_NAME = 'gulp-ttf2woff';

export type GulpTTF2WOFFOptions = {
  ignoreExt?: boolean;
  clone?: boolean;
};

// File level transform function
function ttf2woffTransform() {
  // Return a callback function handling the buffered content
  return function (
    err: Error | null,
    buf: Buffer,
    cb: (err: Error | null, buf?: Buffer) => void,
  ) {
    // Handle any error
    if (err) {
      cb(new PluginError(PLUGIN_NAME, err, { showStack: true }));
    }

    // Use the buffered content
    try {
      buf = Buffer.from(ttf2woff(new Uint8Array(buf)));
      cb(null, buf);
    } catch (err2) {
      cb(new PluginError(PLUGIN_NAME, err2 as Error, { showStack: true }));
    }
  };
}

// Plugin function
function ttf2woffGulp(options?: GulpTTF2WOFFOptions) {
  options = options || {};
  options.ignoreExt = options.ignoreExt || false;
  options.clone = options.clone || false;

  const stream = new Transform({ objectMode: true });

  stream._transform = function (file: Vinyl, _, done) {
    // When null just pass through
    if (file.isNull() || file.isDirectory()) {
      stream.push(file);
      done();
      return;
    }

    // If the ext doesn't match, pass it through
    if (!options.ignoreExt && '.ttf' !== extname(file.path)) {
      stream.push(file);
      done();
      return;
    }

    if (options.clone) {
      stream.push(file.clone());
    }

    file.path = replaceExtension(file.path, '.woff');

    // Buffers
    if (file.isBuffer()) {
      try {
        file.contents = Buffer.from(ttf2woff(new Uint8Array(file.contents)));
      } catch (err) {
        stream.emit(
          'error',
          new PluginError(PLUGIN_NAME, err as Error, {
            showStack: true,
          }),
        );
      }

      // Streams
    } else {
      file.contents = (file.contents as Readable).pipe(
        new BufferStream(ttf2woffTransform()),
      );
    }

    stream.push(file);
    done();
  };

  return stream;
}

// Export the file level transform function for other plugins usage
ttf2woffGulp.fileTransform = ttf2woffTransform;

// Export the plugin main function
export default ttf2woffGulp;
