module.exports = function (grunt) {
	grunt.initConfig({
		clean: { build: ['build'] },
		jade: {
			html: {
				options: { 
					pretty: true,
					data: {}
				},
				files: { 
					'build/index.html': ['frontend/index.jade'],
					'build/testing.html': ['frontend/testing.jade']
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 7777,
					base: 'build'
				}
			}
		},
		sass: {
			options: {
				sourceMap: true
			},
			styles: {
				files: { 
					'build/css/style.css': 'frontend/styles/style.scss'
				}
			}
		},
		watch: {
			options: { livereload: 7776 },
			jade: {
				files: ['frontend/*.jade'],
				tasks: ['jade']
			},
			sass: {
				files: ['frontend/styles/**/*'],
				tasks: ['sass']
			},
			js: {
				files: ['frontend/js/**/*.js'],
				tasks: ['jshint']
			},
			builds: {
				files: ['build/**/*'],
				tasks: []
			}
		},
		jshint: {
			options: { jshintrc: '.jshintrc' },
			code: {
				files: { src: ['frontend/js/**/*.js'] }
			}
		},
		browserify: {
			options: {
				browserifyOptions: { debug: true },
				watch: true
			},
			app: {
				files: { 'build/app.js':'frontend/js/app.js' },
				options: {
					transform: [
						['wrapify', {
							wrappers: [
								{ pattern: "\\.jade", prefix: "- console.log('RENDERING TEMPLATE: $filename')" },
								{ 
									pattern: "\\.jade",
									prefix: "// BEGIN TEMPLATE: $filename",
									suffix: "// END TEMPLATE: $filename"
								}
							]
						}],
						'jadeify',
						['babelify', { presets: ['es2015']}]
					]
				}
			}
		},
		copy: {
			images: {
				files:[{
						expand: true, 
						src: ['frontend/styles/images/*'], 
						dest: 'build/css/', 
						filter: 'isFile', 
						flatten: true
					}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('server', function () {
		require('./server');
	});

	grunt.registerTask('default', ['clean', 'copy', 'jade', 'sass', 'jshint', 'browserify', 'server', 'watch']);
	grunt.registerTask('build', ['clean', 'jade', 'sass', 'copy', 'jshint', 'browserify']);
};