// @ts-check
const gulp = require("gulp");
const path = require("path");
const fs = require("fs");

// config
// @ts-ignore
const buildDir = path.join(__dirname, "./.build");
const config = {
  BUILD_DIR: buildDir,
  STATIC_DIR: path.join(buildDir, "static"),
  SERVER_DIR: path.join(__dirname, "./server"),
  WWW_DIR: path.join(__dirname, "./www")
};

/**
 * tasks
 */

// images
// minifies images and copies to build dir
const imagemin = require("gulp-imagemin");

function images() {
  return gulp
    .src(path.join(config.WWW_DIR, "img/**/*"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 1 })
      ])
    )
    .pipe(gulp.dest(path.join(config.STATIC_DIR, "img")));
}

// css
// sass -> postcss -> minify
const gulpSass = require("gulp-sass");
const gulpPostCSS = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

function css() {
  return gulp
    .src(path.join(config.WWW_DIR, "sass/app.scss"))
    .pipe(
      gulpSass({
        includePaths: [path.join(__dirname, "./www/node_modules")]
      })
    )
    .on("error", gulpSass.logError)
    .pipe(gulpPostCSS([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(path.join(config.STATIC_DIR, "css")));
}

// fonts
// no processing, copy to build dir
function fonts() {
  return gulp
    .src(path.join(config.WWW_DIR, "fonts/**/*"))
    .pipe(gulp.dest(path.join(config.STATIC_DIR, "fonts")));
}

// swagger schema file
// replaces $ref: ${file_path} with the contents of the file
async function swagger(cb) {
  const swaggerDir = path.join(config.SERVER_DIR, "swagger");
  const jsonFile = JSON.parse(
    fs.readFileSync(path.join(swaggerDir, "api.json"), "utf8")
  );

  let newDefinitions = {};
  for (let key in jsonFile.definitions) {
    const refFile = fs.readFileSync(
      path.join(swaggerDir, jsonFile.definitions[key].$ref),
      "utf8"
    );
    newDefinitions[key] = JSON.parse(refFile);
  }

  let newPaths = {};
  for (let key in jsonFile.paths) {
    const refFile = fs.readFileSync(
      path.join(swaggerDir, jsonFile.paths[key].$ref),
      "utf8"
    );
    newPaths[key] = JSON.parse(refFile);
  }

  const newJSON = {
    ...jsonFile,
    definitions: newDefinitions,
    paths: newPaths
  };

  if (fs.existsSync(config.BUILD_DIR) === false) {
    fs.mkdirSync(config.BUILD_DIR, {
      recursive: true
    });
  }

  fs.writeFile(
    path.join(config.BUILD_DIR, "api.json"),
    JSON.stringify(newJSON, null, 2),
    cb
  );
}

const build = gulp.parallel([images, css, fonts, swagger]);

exports.build = gulp.parallel([images, css, fonts, swagger]);
exports.default = build;

const nodemon = require("gulp-nodemon");
const webpack = require("webpack");

exports.watch = function(cb) {
  build(cb);

  // server
  nodemon({
    script: "server.js",
    ext: "js html dust",
    env: {
      NODE_ENV: "development"
    },
    watch: ["server/**/*"],
    // @ts-ignore
    done: cb
  });

  // www
  gulp.watch("www/img", images);
  gulp.watch("www/sass", css);
  gulp.watch("www/fonts", fonts);

  // www - webpack
  // calling webpack Node API since using
  // gulp + webpack can get complicated
  const compiler = webpack(require("./www/webpack.config"));
  compiler.watch({ aggregateTimeout: 300, poll: 1000 }, (err, stats) => {
    cb();
    if (err) console.error(err);
    console.log(
      stats.toString({
        chunks: false,
        colors: true
      })
    );
  });
};
