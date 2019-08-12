import gulp from "gulp";
import cp from "child_process";
import gutil from "gulp-util";
import postcss from "gulp-postcss";
import cssImport from "postcss-import";
import cssnext from "postcss-cssnext";
import BrowserSync from "browser-sync";
import webpack from "webpack";
import webpackConfig from "./webpack.conf";
import svgstore from "gulp-svgstore";
import svgmin from "gulp-svgmin";
import inject from "gulp-inject";
import cssnano from "cssnano";
import imagemin from "gulp-imagemin";
const workbox = require("workbox-build");
const remover = require("postcss-uncss")
// const webp = require("imagemin-webp")
const emq = require("postcss-extract-media-query")
// const replace = require("gulp-ext-replace")
const scaleImages = require("gulp-scale-images")
const flatMap = require("flat-map").default

const browserSync = BrowserSync.create();
const defaultArgs = ["-d", "../dist", "-s", "site"];

var hugoBin = `./bin/hugo.${process.platform === "win32" ? "exe" : process.platform}`;

if (process.env.HUGO_VERSION) {
  hugoBin = 'hugo'
}

if (process.env.DEBUG) {
  defaultArgs.unshift("--debug")
}

gulp.task("hugo", (cb) => buildSite(cb));
gulp.task("hugo-preview", (cb) => buildSite(cb, ["--buildDrafts", "--buildFuture"]));
gulp.task("build", ["js", "css", "hugo", "img:build", "svg", "generate-service-worker"]);
gulp.task("build-preview", ["js", "css", "hugo-preview", "img:build", "svg", "generate-service-worker"]);

gulp.task("css", () => (
  gulp.src("./src/css/*.css")
    .pipe(postcss([
      cssImport({from: "./src/css/main.css"}),
      // remover({html: "./dist/**/*.html", htmlroot: "./dist"}),
      cssnext(),
      cssnano(),
      emq({output: {
        minimize: true,
        path: "./dist/css",
        name: '[name]-[query].[ext]'
    }})
    ]))
    .pipe(gulp.dest("./dist/css"))
    .pipe(browserSync.stream())
));

gulp.task("js", (cb) => {
  const myConfig = Object.assign({}, webpackConfig);

  webpack(myConfig, (err, stats) => {
    if (err) throw new gutil.PluginError("webpack", err);
    gutil.log("[webpack]", stats.toString({
      colors: true,
      progress: true
    }));
    browserSync.reload();
    cb();
  });
});

gulp.task("svg", () => {
  const svgs = gulp
    .src("site/static/img/icons-*.svg")
    .pipe(svgmin())
    .pipe(svgstore({inlineSvg: true}));

  function fileContents(filePath, file) {
    return file.contents.toString();
  }

  return gulp
    .src("site/layouts/partials/svg.html")
    .pipe(inject(svgs, {transform: fileContents}))
    .pipe(gulp.dest("site/layouts/partials/"));
});

gulp.task("server", ["hugo", "js", "css", "img:build", "svg", "generate-service-worker"], () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch("./src/js/**/*.js", ["js"]);
  gulp.watch("./src/css/**/*.css", ["css"]);
  gulp.watch("./site/static/img/icons-*.svg", ["svg"]);
  gulp.watch("./site/**/*", ["hugo"]);
});

function buildSite(cb, options) {
  const args = options ? defaultArgs.concat(options) : defaultArgs;

  return cp.spawn(hugoBin, args, {stdio: "inherit"}).on("close", (code) => {
    if (code === 0) {
      browserSync.reload("notify:false");
      cb();
    } else {
      browserSync.notify("Hugo build failed :(");
      cb("Hugo build failed");
    }
  });
}
gulp.task("generate-service-worker", ["js", "css"], () => {
    return workbox.generateSW({
        importWorkboxFrom: 'local',
        offlineGoogleAnalytics: true,
        globDirectory: "dist",
        cleanupOutdatedCaches: true,
        globPatterns: [
            "**/*.{css,js}"
        ],
        swDest: "./dist/sw.js",
        modifyUrlPrefix: {
            "": "/"
        },
        clientsClaim: true,
        skipWaiting: true,
        // ignoreUrlParametersMatching: [/./],
        offlineGoogleAnalytics: true,
        // maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
            {
                urlPattern: /(?:\/)$/,
                handler: "networkFirst",
                options: {
                    cacheName: "html",
                    networkTimeoutSeconds: 10,
                    expiration: {
                        maxAgeSeconds: 60 * 60 * 24 * 7,
                    },
                },
            },
            // {
            //     urlPattern: /\.(?:css|js)$/,
            //     handler: "cacheFirst",
            //     options: {
            //         cacheName: "chrome",
            //         expiration: {
            //             maxAgeSeconds: 60 * 60 * 24 * 7,
            //         },
            //     },
            // },
            {
                urlPattern: /\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico|woff|woff2)$/,
                handler: "cacheFirst",
                options: {
                    cacheName: "images",
                    expiration: {
                        maxEntries: 1000,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                },
            },
            {
                urlPattern: /\.(?:mp3|wav|m4a)$/,
                handler: "cacheFirst",
                options: {
                    cacheName: "audio",
                    expiration: {
                        maxEntries: 1000,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                },
            },
            {
                urlPattern: /\.(?:m4v|mpg|avi)$/,
                handler: "cacheFirst",
                options: {
                    cacheName: "videos",
                    expiration: {
                        maxEntries: 1000,
                        maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                },
            }
        ],
    });
});
const responsiveImages = (file, cb) => {
    const webpFileS = file.clone()
    webpFileS.scale = {maxWidth: 480, format: 'webp'}
    const webpFileM = file.clone()
    webpFileM.scale = {maxWidth: 960, format: 'webp'}
    const webpFileL = file.clone()
    webpFileL.scale = {maxWidth: 1920, format: 'webp'}
    const jpegFileS = file.clone()
    jpegFileS.scale = {maxWidth: 480, format: 'jpeg'}
    const jpegFileM = file.clone()
    jpegFileM.scale = {maxWidth: 960, format: 'jpeg'}
    const jpegFileL = file.clone()
    jpegFileL.scale = {maxWidth: 1920, format: 'jpeg'}
  // console.log(typeof webpFileS.scale)
    cb(null, [webpFileS, webpFileM, webpFileL, jpegFileS, jpegFileM, jpegFileL])
}
gulp.task("img:build", () =>
  gulp.src(["./site/static/img/*.{jpg,jpeg,png}"])
    // Optimise images
    // .pipe(console.log)
    // .pipe(imagemin([webp({quality: 50})]))
    // .pipe(replace("webp"))
    .pipe(flatMap(responsiveImages)) 
    .pipe(scaleImages())
    .pipe(gulp.dest("./dist/img"))
);
