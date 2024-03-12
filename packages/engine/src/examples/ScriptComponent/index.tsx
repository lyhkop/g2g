import React, { useEffect, useRef } from "react";

import Editor, { Monaco } from "@monaco-editor/react";

interface ScriptDemoProps {
  id: string;
}

class Engine {

  _scripts: any[] = []

  run() {
    const loop = ()=>{
      this.updateScriptSystem();
      window.requestAnimationFrame(loop)
    }
    loop();
  }

  initScriptSystem(scripts: string[]) {
    const callBacks = scripts.map(script=>{
      return (new Function('engine', script)).bind(this)(this)
    })
    this._scripts = callBacks
  }

  addScript(script: string) {
    const func = (new Function('engine', script)).bind(this)(this)
    this._scripts.push(func)
  }

  updateScriptSystem() {
    this._scripts.forEach(script=>{
      script(this);
    })
  }
}

export function ScriptDemo({ id }: ScriptDemoProps) {
  const monacoRef = useRef(null);

  function handleEditorWillMount(monaco: Monaco) {
    // here is the monaco instance
    // do something before editor is mounted
    // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2015,
      allowNonTsExtensions: true,
    });

    // extra libraries
    var libSource = [
      "declare class Facts {",
      "    /**",
      "     * Returns the next fact",
      "     */",
      "    static next():string",
      "}",
    ].join("\n");
    var libUri = "ts:filename/facts.d.ts";
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      libSource,
      libUri
    );
    // When resolving definitions and references, the editor will try to use created models.
    // Creating a model for the library allows "peek definition/references" commands to work with the library.
    monaco.editor.createModel(
      libSource,
      "typescript",
      monaco.Uri.parse(libUri)
    );
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    // here is another way to get monaco instance
    // you can also store it in `useRef` for further usage
    monacoRef.current = monaco;
  }

  useEffect(()=>{
    const engine = new Engine()

    const script = `
    const a = 104;    
    class MyScript {
      onInit() {
        console.log(a)
      }
      onUpdate() {
      }
    }
    
    function onUpdate(engine) {
      const script = new MyScript()
      script.onInit()
      console.log(engine);
    }

    return onUpdate;
    `

    engine.initScriptSystem([script]);

    engine.run();
  }, [])

  return (
    <div className="h-[600px] w-[800px]">
      <Editor
        defaultLanguage="javascript"
        defaultValue="const a = 'hello world!'; // some comment"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
}
