module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),

    copyrightSince: function(year) {
      now = new Date().getFullYear();
      return year + (now > year ? '-' + now : '');
    },

    clean: {
      build: ['build'],
      dist: ['build', '**/*.log', 'lib', 'node_modules']
    },

    copy: {
      options: {
        processContent: function (content, srcpath) {
          return grunt.template.process(content);
        }
      },
      license: {
        src: 'tmpl/license.tmpl',
        dest: 'LICENSE.txt'
      }
    },

    less: {
      dist: {
        files: grunt.file.expandMapping(['src/*.less'], 'build/', {
          rename: function(dest, src) {
            return dest + src.replace(/src\/(.+)\.less$/, '$1.css');
          }
        })
      }
    },

    coffeelint: {
      src: ['src/*.coffee']
    },

    coffee: {
      build: {
        cwd: 'src/',
        src: ['*.coffee'],
        dest: 'build/',
        ext: '.js',
        expand: true
      }
    },

    htmlbuild: {
      dist: {
        src: 'src/*.html',
        dest: './build/',
        options: {
          scripts: {
            'conpinion-circular-image-button': ['build/conpinion-circular-image-button.js']
          },
          styles: {
            'conpinion-circular-image-button': ['build/*.css', 'src/conpinion-circular-image-button.css']
          },
          data: {
            copyright: grunt.file.read('tmpl/copyright.tmpl')
          }
        }
      }
    },

    replace: {
      dist: {
        src: 'build/*.html',
        dest: './',
        replacements: [{
          from: /href="..\/lib\/([^"]+)"/g,
          to: 'href="../$1"'
        }]
      }
    },

    connect: {
      server: {
      }
    },

    watch: {
      stylesheets: {
        files: 'src/*.less',
        tasks: ['less', 'htmlbuild']
      },
      scripts: {
        files: 'src/*.coffee',
        tasks: ['coffee', 'htmlbuild']
      },
      html: {
        files: ['index.html', 'src/*.html'],
        tasks: ['htmlbuild']
      },
      tests: {
        files: 'test/*.html',
        tasks: []
      },
      options: {
        livereload: true
      }
    },

    bumpversion: {
      options: {
        files: ['bower.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitFiles: ['-a'],
        commitMessage:'Bump version number to %VERSION%',
        createTag: true,
        tagName: '%VERSION%',
        tagMessage:'Version %VERSION%',
        push: false
      }
    },

    changelog: {
      options: {
      }
    },

    'wct-test': {
      local: {
        options: {
          remote: false,
          plugins: {
            local: {
              browsers: ['chrome']
            }
          }
        }
      }
    },

    shell: {
      test: {
        command: 'xvfb-run -a ./bin/grunt wct-test'
      }
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-html-build');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('web-component-tester');

  grunt.registerTask('build', 'Compile all assets and create the distribution files',
    ['less', 'coffeelint', 'coffee', 'htmlbuild', 'replace']);

  grunt.registerTask('test', 'Test the web application', ['shell:test']);

  grunt.task.renameTask('bump', 'bumpversion');

  grunt.registerTask('bump', '', function(versionType) {
    versionType = versionType ? versionType : 'patch';
    grunt.task.run(['bumpversion:' + versionType + ':bump-only',
      'build', 'copy:license', 'changelog', 'bumpversion::commit-only']);
  });

  grunt.registerTask('register', 'Register the web component bower package', function() {
    var done = this.async();
    var rest = require('restler');
    rest.post('http://bowerindex.conpiniondo.conpinion.de/registerPackage', {
      data: {
        name: grunt.config.get("pkg.name"),
        repo: grunt.config.get("pkg.repository.url")
      }
    });
  });

  grunt.registerTask('release', 'Release the web component',
    ['build', 'test', 'register']
  );

  grunt.registerTask('default', 'Build the software, start a web server and watch for changes',
    ['build', 'connect', 'watch']
  );
};