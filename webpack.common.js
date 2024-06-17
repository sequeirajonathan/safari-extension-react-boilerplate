const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const ejs = require('ejs');
const { version } = require('./package.json');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    'popup/popup': "./popup/index.tsx",
    content: "./content.ts",
    background: "./background.ts",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // Compiles Sass to CSS
          }
        ]
      }
    ]
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
            ignore: ['**/manifest.json', '**/.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        // Append variables to popup.html
        { 
          from: path.resolve(__dirname, 'src/popup/popup.html'), 
          to: path.resolve(__dirname, 'dist/popup/popup.html'), 
          transform: transformHtml 
        },
        // Update manifest version from package.json
        {
          from: path.resolve(__dirname, 'public/manifest.json'),
          to: path.resolve(__dirname, 'dist/manifest.json'),
          transform: (content) => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;
            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ]
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  }
};

function transformHtml(content) {
  return ejs.render(content.toString(), {
    ...process.env,
  });
}
