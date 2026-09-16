import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import SafeScreen from '../components/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PRACTICE_PROGRAMS } from '../assets/data/programs';
import { CustomAlert } from "../components/shared/GlobalAlert";

export default function Playground() {
  const router = useRouter();
  const { initialCode, programId } = useLocalSearchParams();
  const webViewRef = useRef(null);
  
  // Find program if programId is passed
  const program = programId ? PRACTICE_PROGRAMS.find(p => p.id === programId) : null;

  // Determine default code
  let defaultCode = `// Write your JavaScript code here\nconsole.log("Hello, World!");\n\n// Or write HTML/JS to manipulate the DOM\ndocument.getElementById("preview-view").innerHTML = "<h1>Playground Ready!</h1>";`;
  
  if (program) {
    defaultCode = program.starterCode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  } else if (initialCode) {
    defaultCode = decodeURIComponent(initialCode).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // HTML Content with CodeMirror embedded via CDN
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/theme/dracula.min.css">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/mode/javascript/javascript.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.14.7/beautify.min.js"></script>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; background: #282a36; font-family: sans-serif; display: flex; flex-direction: column; }
        .tabs { display: flex; background: #1e1e1e; border-bottom: 1px solid #444; }
        .tab { flex: 1; padding: 12px; text-align: center; color: #aaa; cursor: pointer; font-size: 14px; font-weight: bold; }
        .tab.active { color: #fff; background: #282a36; border-bottom: 2px solid #28a745; }
        .content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        #code-view { flex: 1; display: flex; flex-direction: column; position: relative; }
        #preview-view { flex: 1; display: none; background: #fff; color: #000; padding: 10px; overflow-y: auto; }
        #console-view { flex: 1; display: none; background: #1e1e1e; color: #0f0; padding: 15px; font-family: monospace; overflow-y: auto; font-size: 14px; }
        .CodeMirror { flex: 1; height: auto; font-size: 14px; }
        .floating-format-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: #0C1D59;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4);
          z-index: 10;
        }
        .floating-format-btn:active {
          background: #132F94;
        }
      </style>
    </head>
    <body>
      <div class="tabs">
        <div class="tab active" id="tab-code" onclick="switchTab('code')">Code</div>
        <div class="tab" id="tab-preview" onclick="switchTab('preview')">Preview</div>
        <div class="tab" id="tab-console" onclick="switchTab('console')">Console</div>
      </div>

      <div class="content">
        <div id="code-view">
          <textarea id="editor">${defaultCode}</textarea>
          <button class="floating-format-btn" onclick="formatCode()">✨ Format</button>
        </div>
        <div id="preview-view"></div>
        <div id="console-view">Console output will appear here...</div>
      </div>
      
      <script>
        var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
          lineNumbers: true,
          mode: "javascript",
          theme: "dracula",
          viewportMargin: Infinity
        });

        function formatCode() {
          try {
            var code = editor.getValue();
            if (typeof js_beautify !== 'undefined') {
              var formatted = js_beautify(code, { indent_size: 2, space_in_empty_paren: true });
              editor.setValue(formatted);
              
              var btn = document.querySelector('.floating-format-btn');
              if (btn) {
                var oldText = btn.innerHTML;
                btn.innerHTML = '✅ Formatted!';
                setTimeout(() => btn.innerHTML = oldText, 1500);
              }
            } else {
              console.log("Formatter script not loaded.");
            }
          } catch(e) {
            console.log("Format error: " + e.message);
          }
        }

        function switchTab(tab) {
          ['code', 'preview', 'console'].forEach(t => {
            document.getElementById(t + '-view').style.display = (t === tab) ? 'flex' : 'none';
            document.getElementById('tab-' + t).classList.toggle('active', t === tab);
          });
          if (tab === 'code') setTimeout(() => editor.refresh(), 10);
        }

        // Intercept console.log
        var oldLog = console.log;
        console.log = function(...args) {
          var consoleDiv = document.getElementById('console-view');
          if (consoleDiv.innerHTML === 'Console output will appear here...') consoleDiv.innerHTML = '';
          consoleDiv.innerHTML += args.join(' ') + '<br/>';
          oldLog.apply(console, args);
        };

        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
          handleMessage(event.data);
        });
        window.addEventListener('message', function(event) {
          handleMessage(event.data);
        });

        function handleMessage(dataStr) {
          try {
            var eventData = JSON.parse(dataStr);
            if (eventData.type === 'run') {
              switchTab('console'); // Auto-switch to console tab when code runs
              document.getElementById('console-view').innerHTML = ''; // clear console
              var code = editor.getValue();
              try {
                new Function(code)();
              } catch (err) {
                console.log('<span style="color:red">' + err.toString() + '</span>');
              }
            } else if (eventData.type === 'injectSolution') {
              editor.setValue(decodeURIComponent(eventData.code));
              formatCode(); // Format the injected solution
            }
          } catch(e) {}
        }
      </script>
    </body>
    </html>
  `;

  const runCode = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({ type: 'run' }), '*');
        true;
      `);
    }
  };

  const injectSolution = () => {
    if (webViewRef.current && program?.solutionCode) {
      webViewRef.current.injectJavaScript(`
        window.postMessage(JSON.stringify({ 
          type: 'injectSolution', 
          code: "${encodeURIComponent(program.solutionCode)}"
        }), '*');
        true;
      `);
    }
  };

  const handleShowSolution = () => {
    CustomAlert.alert(
      "View Solution?",
      "Are you sure you want to view the solution? This will replace your current code.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "View Solution", onPress: injectSolution, style: "destructive" }
      ]
    );
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#132F94" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{program ? program.title : "Code Playground"}</Text>
        <View style={styles.headerRight}>
          {program?.solutionCode && (
            <TouchableOpacity onPress={handleShowSolution} style={styles.solutionButton}>
              <Ionicons name="bulb" size={16} color="#E53935" />
              <Text style={styles.solutionButtonText}>Solution</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={runCode} style={styles.runButton}>
            <Ionicons name="play" size={18} color="white" />
            <Text style={styles.runButtonText}>Run</Text>
          </TouchableOpacity>
        </View>
      </View>
      <WebView 
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#CBE7F7',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'quicksand-bold',
    color: '#132F94',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  solutionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EF9A9A',
  },
  solutionButtonText: {
    color: '#D32F2F',
    fontFamily: 'nunito-bold',
    fontSize: 12,
  },
  runButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  runButtonText: {
    color: 'white',
    fontFamily: 'nunito-bold',
    fontSize: 13,
  },
  webview: {
    flex: 1,
  }
});
