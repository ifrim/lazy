module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
    
		traceur: {
			options: {
			},
			app: {
				files: {
					'app/app.js': ['app/js/**/*.js']
				}
			}
		},
		
		watch: {
			js: {
				files: ['app/js/**/*.js'],
				tasks: ['traceur']
			}
		}
	  
	});

	grunt.loadNpmTasks('grunt-traceur');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', []);

};