module.exports = function(grunt){

	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

		cssc: {
		    build: {
		        options: {
		            consolidateViaDeclarations: true,
		            consolidateViaSelectors:    true,
		            consolidateMediaQueries:    true
		        },
		        files: {
		            'assets/css/index.css': 'assets/css/index.css'
		        }
		    }
		},

		cssmin: {
		    build: {
		        src: 'assets/css/index.css',
		        dest: 'assets/css/index.css'
		    }
		},

		sass: {
		    build: {
		        files: {
		            'assets/css/index.css': 'assets/sass/index.scss'
		        }
		    }
		},

		// compass: {
		// 	dev: {
		// 		options: {
		// 			config: 'config.rb'
		// 		}
		// 	}
		// },

		uglify: {
			build: {
				files: {
					'assets/js/index.min.js': ['assets/js/index.js']
				}
			}
		},

		concat: {
			buildIndex: {
				src: [	
						'assets/polopoly-header.html',
						'assets/concat/style-open.txt',
						'assets/css/index.css',
						'assets/concat/style-close.txt',
						'assets/widget.html',
						// 'assets/concat/socket-io.txt',
						'assets/concat/script-open.txt',
						'assets/js/index.js',
						'assets/concat/script-close.txt',
						'assets/polopoly-footer.html'
						],
				dest: 'build/index.html'
			},
			distIndex: {
				src: [	
						'assets/concat/style-open.txt',
						'assets/css/index.css',
						'assets/concat/style-close.txt',
						'assets/widget.html',
						'assets/concat/script-open.txt',
						'assets/js/index.min.js',
						'assets/concat/script-close.txt',
						],
				dest: 'dist/index.html'
			}
		},

		browser_sync: {
			files: {
				src: [
					'build/index.html',
					]
			},
			options: {
				watchTask: true
			}
		},

		watch: {
		    css: {
		        files: ['assets/sass/**/*.scss'],
		        tasks: ['buildcss','concat']
		    },
			uglify: {
				files: ['assets/js/index.js'],
				tasks: ['uglify','concat']
			},
			concat: {
				files: ['assets/*'],
				tasks: ['concat']
			}
		}

    });

    grunt.registerTask('default', ['browser_sync', 'watch']);
    // use build css for the final dist css
    grunt.registerTask('buildcss',  ['sass', 'cssc', 'cssmin']);

};