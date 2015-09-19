var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'bower_components',
            src: ['bootstrap/**'], dest: 'vendor'
          },
          {
            expand: true, cwd: 'bower_components/font-awesome/',
            src: ['less/**'], dest: 'vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'bower_components/jquery/dist/',
            src: ['jquery.js'], dest: 'vendor/jquery/'
          },
          {
            expand: true, cwd: 'bower_components/moment/',
            src: ['moment.js'], dest: 'vendor/moment/'
          },
          {
            expand: true, cwd: 'bower_components/underscore/',
            src: ['underscore.js'], dest: 'vendor/underscore/'
          },
					{
            expand: true, cwd: 'bower_components/requirejs/',
            src: ['require.js'], dest: 'vendor/requirejs/'
          },
          {
            expand: true, cwd: 'bower_components/backbone/',
            src: ['backbone.js'], dest: 'vendor/backbone/'
          },
          {
            expand: true, flatten: true, cwd: 'bower_components/eonasdan-bootstrap-datetimepicker',
            src: ['src/js/bootstrap-datetimepicker.js','build/css/bootstrap-datetimepicker.css'], dest: 'vendor/eonasdan-bootstrap-datetimepicker'
          },
          {
            expand: true, cwd: 'bower_components/bootstrap3-typeahead',
            src: ['bootstrap3-typeahead.js'], dest: 'vendor/bootstrap3-typeahead/'
          }
        ]
      },
			source : {
				files:[
					{expand: true, src: ['app/**/*', 'index.js', 'package.json'], dest: 'dist/' },
          {expand: true, flatten: true, src: ['public/img/*'], dest: 'dist/public/img/'},
          {expand: true, flatten: true, src: ['public/js/lib/*'], dest: 'dist/public/js/lib'},
          {expand: true, flatten: true, cwd: 'bower_components/font-awesome/fonts',src: ['*'], dest: 'dist/public/fonts/'},
          {expand: true, flatten: true, cwd: 'bower_components/bootstrap/fonts',src: ['*'], dest: 'dist/public/fonts/'},
          //{expand: true, src: ['public/js/views/**'], dest: 'dist/' },
				]
			}
    },

		concat: {
			core: {
				files: {
	        'build/js/core.js': [
	          'vendor/jquery/jquery.js',
            'vendor/moment/moment.js',
	          'vendor/underscore/underscore.js',
            'vendor/backbone/backbone.js',
						'public/js/common/core.js',
            //'vendor/requirejs/require.js',
						//'public/js/common/require.config.js',
	          'vendor/bootstrap/dist/js/bootstrap.js',
            'vendor/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.js',
            'vendor/bootstrap3-typeahead/bootstrap3-typeahead.js'
	        ],
					'build/css/core.css': ['build/css/bootstrap.css','build/css/eonasdan-bootstrap-datetimepicker.css','build/css/base.css']
	      }
			}
		},

		// Minify the CSS
		cssmin: {
			dist: {
				files: {
					'dist/public/css/core.min.css': ['build/css/core.css'],
          'dist/public/css/admin.min.css': ['build/css/admin.css'],
          'dist/public/css/supersize.css': ['public/css/supersize.css'],
					'dist/public/css/user.min.css': ['build/css/user.css']
				}
			}
		},
    watch: {
      client: {
       files: [
        'public/js/layouts/**/*.js', '!public/js/layouts/**/*.min.js',
        'public/js/views/**/*.js', '!public/js/views/**/*.min.js'
       ],
       tasks: ['shell'/*'newer:uglify', 'newer:jshint:client'*/],
       options: {
        spawn:false
       }
      },
      server: {
       files: ['app/**/*.js','app/**/*.ejs', 'index.js'],
       tasks: ['shell'/*'newer:jshint:server'*/],
       options: {
        spawn:false
       }
      },
      clientLess: {
       files: [
        'public/css/**/*.less'
       ],
       tasks: ['newer:less']
      }
    },
    uglify: {
      core: {
        files: {
          'dist/public/js/core.min.js': 'build/js/core.js'
        }
      },
      views :{
        files: [{
          cwd: 'public/js/views',
          src: '**/*.js',
          dest: 'dist/public/js/views/',
          expand: true
        }]
      },
      layouts :{
        files: {
          //'dist/public/js/layouts/admin.js': ['public/js/layouts/admin.js']
        }
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'public/layouts/**/*.min.js',
            'public/views/**/*.min.js'
          ]
        },
        src: [
          'public/layouts/**/*.js',
          'public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: false
      },
      layouts: {
        files: {
          'build/css/bootstrap.css': ['vendor/bootstrap/less/bootstrap.less','vendor/font-awesome/fonts/less/*.less'],
          'build/css/eonasdan-bootstrap-datetimepicker.css': 'vendor/eonasdan-bootstrap-datetimepicker/bootstrap-datetimepicker.css',
          'build/css/base.css': 'public/css/base.less',
          'build/css/admin.css': ['public/css/admin/admin.less'],
					'build/css/user.css': ['public/css/admin/user.less']
        }
      }
    },
    shell: {
      deploy: {
        command: "rsync -avvrz --exclude-from '.gitignore' dist/ ec2:/var/www/punditly"
      }
    },
    clean: ['dist', 'build', 'vendor']
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['clean', 'copy', 'less', 'concat', 'uglify', 'cssmin', 'shell']);
  grunt.registerTask('build', ['clean', 'copy', 'less', 'concat']);
  grunt.registerTask('lint', ['jshint']);

  // on watch events
  grunt.event.on('watch', function(action, filepath, target){
    grunt.config('shell.deploy.command', 'rsync -zR ' + filepath + ' ec2:/var/www/punditly');
  });

};
