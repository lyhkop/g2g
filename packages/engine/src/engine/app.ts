import { EventEmitter } from 'events';
import { AssetManager } from './asset-manager';

class App extends EventEmitter {
  assetManager = new AssetManager();
}

export { App };
