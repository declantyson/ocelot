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
                    banner: '/* \n' +
                        '  * \n' +
                        '  *  Ocelot \n' +
                        '  *  <%= pkg.author %> \n' +
                        '  *  v<%= pkg.version %> \n' +
                        '  *  <%= grunt.template.today("dd/mm/yyyy") %> \n' +
                        '  * \n' +
                        '  */' +
                        '\n\n',
                    transform: [["babelify"]],
                    browserifyOptions: {
                        standalone: 'Ocelot'
                    }
                },
                files: {
                    "dist/Ocelot.js": "src/babel/*.js"
                }
            }
        },
        uglify: {
            options: {
                banner: '/* \n' +
                    '  * \n' +
                    '  *  Ocelot \n' +
                    '  *  <%= pkg.author %> \n' +
                    '  *  v<%= pkg.version %> \n' +
                    '  *  <%= grunt.template.today("dd/mm/yyyy") %> \n' +
                    '  * \n' +
                    '  */' +
                    '\n\n',
                mangle: true
            },
            build: {
                src: ['dist/*.js', '!dist/*.min.js'],
                dest: 'dist/Ocelot.min.js'
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