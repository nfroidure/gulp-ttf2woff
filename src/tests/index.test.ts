import { describe, test, expect } from '@jest/globals';
import { Readable, PassThrough } from 'node:stream';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import gulp from 'gulp';
import Vinyl from 'vinyl';
import StreamTest from 'streamtest';
import ttf2woff from '../index.js';

const filename = join('src', 'tests', 'fixtures', 'iconsfont');
const woff = await readFile(filename + '.woff');

describe('gulp-ttf2woff conversion', () => {
  describe('with null contents', () => {
    test('should let null files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: null,
        }),
      ])
        .pipe(ttf2woff())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toEqual('bibabelula.foo');
      expect(objs[0].contents).toEqual(null);
    });
  });

  describe('in buffer mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulp
        .src(filename + '.ttf', {
          buffer: true,
          removeBOM: false,
          encoding: false,
        })
        .pipe(ttf2woff())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain(filename + '.woff');
      expect(objs[0].contents).toEqual(woff);
    });

    test('should work with the clone option', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulp
        .src(filename + '.ttf', {
          buffer: true,
          removeBOM: false,
          encoding: false,
        })
        .pipe(ttf2woff({ clone: true }))
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(2);
      expect(objs[0].path).toContain(filename + '.ttf');
      expect(objs[0].contents).toEqual(await readFile(filename + '.ttf'));
      expect(objs[1].path).toContain(filename + '.woff');
      expect(objs[1].contents).toEqual(woff);
    });

    test('should let non-ttf files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: new Buffer('ohyeah'),
        }),
      ])
        .pipe(ttf2woff())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toEqual('bibabelula.foo');
      expect((objs[0].contents as Buffer).toString()).toEqual('ohyeah');
    });
  });

  describe('in stream mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();

      gulp
        .src(filename + '.ttf', {
          buffer: false,
          removeBOM: false,
          encoding: false,
        })
        .pipe(ttf2woff())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toContain(filename + '.woff');
      (objs[0].contents as Readable).pipe(contentStream1);

      expect(Buffer.concat(await contentResult1)).toEqual(woff);
    });

    test('should work with the clone option', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();
      const [contentStream1, contentResult1] = StreamTest.toChunks();
      const [contentStream2, contentResult2] = StreamTest.toChunks();

      gulp
        .src(filename + '.ttf', {
          buffer: false,
          removeBOM: false,
          encoding: false,
        })
        .pipe(ttf2woff({ clone: true }))
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(2);
      expect(objs[0].path).toContain(filename + '.ttf');
      expect(objs[1].path).toContain(filename + '.woff');
      (objs[0].contents as Readable).pipe(contentStream1);
      expect(Buffer.concat(await contentResult1)).toEqual(
        await readFile(filename + '.ttf'),
      );
      (objs[1].contents as Readable).pipe(contentStream2);
      expect(Buffer.concat(await contentResult2)).toEqual(woff);
    });

    test('should let non-ttf files pass through', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      StreamTest.fromObjects([
        new Vinyl({
          path: 'bibabelula.foo',
          contents: new PassThrough(),
        }),
      ])
        .pipe(ttf2woff())
        .pipe(stream);

      const objs = await result;

      expect(objs.length).toEqual(1);
      expect(objs[0].path).toEqual('bibabelula.foo');
      expect(objs[0].contents instanceof PassThrough).toBeTruthy();
    });
  });
});
