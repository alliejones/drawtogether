module.exports = function(grunt) {

  var libraries = [
    'components/jquery/jquery.js',
    'components/bootstrap/js/bootstrap-transition.js',
    'components/bootstrap/js/bootstrap-modal.js'
  ];

  var files = [
    'components/doodler/dist/doodler.js',
    'client/js/wschat.js',
    'client/js/chat.js',
    'client/js/drawing.js'
  ];

  grunt.initConfig({
    jshint: {
      all: files.concat(['Gruntfile.js'])
    },

    concat: {
      all: {
        src: libraries.concat(files),
        dest: 'public/drawtogether.all.js'
      }
    },

    uglify: {
      all: {
        files: {
          'public/drawtogether.min.js': libraries.concat(files)
        }
      }
    },

    less: {
      development: {
        options: {
        },
        files: {
          "public/style.css": "client/css/style.less"
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          "public/style.min.css": "client/css/style.less"
        }
      }
    },

    watch: {
      js: {
        files: files,
        tasks: [ 'jshint', 'concat' ],
        options: { debounceDelay: 250 }
      },
      less: {
        files: [ 'client/css/**/*.less' ],
        tasks: [ 'less:development' ],
        options: { debounceDelay: 250 }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', [ 'jshint', 'concat', 'less:development' ]);
  grunt.registerTask('prod', [ 'uglify', 'less:production' ]);

  var growl = require('growl');

  ['warn', 'fatal'].forEach(function(level) {
    grunt.util.hooker.hook(grunt.fail, level, function(opt) {
      growl(opt.name, {
        title: opt.message,
        image: 'Console'
      });
    });
  });
};