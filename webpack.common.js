const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ejs = require('ejs');
const { version } = require('./package.json');

module.exports = {
  context: __dirname,  // Set context to the root directory
  entry: {
    popup: './src/popup/index.tsx',
    content: './src/content.ts',
    background: './src/background.ts',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader', // Creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // Translates CSS into CommonJS
          },
          {
            loader: 'sass-loader', // Compiles Sass to CSS
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: path.resolve(__dirname, 'dist'),
          globOptions: {
            dot: true,
            gitignore: true,
            ignore: ['**/.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        // Place popup.html in the root of dist
        {
          from: path.resolve(__dirname, 'src/popup/popup.html'),
          to: path.resolve(__dirname, 'dist/popup.html'),
          transform: transformHtml,
        },
        // Update manifest version from package.json
        {
          from: path.resolve(__dirname, 'public/manifest.json'),
          to: path.resolve(__dirname, 'dist/manifest.json'),
          transform: content => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;
            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ],
    }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
};

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}
