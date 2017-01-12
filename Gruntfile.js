module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            babel: {
                files: ['src/*.js'],
                tasks: ['babel', 'browserify']
            },
            uglify: {
                files: ['dist/*.js', '!dist/*.min.js'],
                tasks: ['uglify']
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd:  'src/',
                    src: ['*.js'],
                    dest: 'src/babel/',
                    ext: '.js'
                }]
            }
        },
        browserify: {
            dist: {
                options: {
                    transform: [["babelify"]],
                    browserifyOptions: {
                        standalone: '<%= pkg.name %>'
                    }
                },
                files: {
                    "dist/<%= pkg.name %>.js": "src/babel/*.js"
                }
            }
        },
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                mangle: true
            },
            build: {
                src: ['dist/*.js', '!dist/*.min.js'],
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        }
    });
 
  // Plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['watch']);
};