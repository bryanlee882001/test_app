import React, { Component } from 'react';
import KfxWebSDK from './KfxWebSDK';
import './App.css';
import './CSS/KfxWebSDK.css';
import CaptureRaw from './kofax/capture'
import IDCaptureModule from './Components/IDCaptureModule'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAutoCaptureSupported: false,
      front64: null,
      back64: null,
    };
    this.CaptureModule = null
  }


  componentDidMount() {
    this.Capture = CaptureRaw(KfxWebSDK);
    this.checkForAutoCaptureSupport()
  }

  checkForAutoCaptureSupport = () => {
      KfxWebSDK.Utilities.supportsAutoCapture(function(){
      console.log('auto cap - supported')
      this.setState({
        isAutoCaptureSupported: true
      })
		}.bind(this),function(){
      console.log('auto cap - not supported')
      this.setState({
        isAutoCaptureSupported: false
      })
		}.bind(this));
  };

  getCaptureModule = (type) => {
    const {
      isAutoCaptureSupported,
      back64,
      front64,
    } = this.state
    const {
      Capture,
    } = this

    switch (type) {
      case 'id':
        return (
          <IDCaptureModule
            KfxWebSDK={KfxWebSDK}
            CaptureAPI={Capture}
            isAutoCaptureSupported={isAutoCaptureSupported}
            setBase64={this.setBase64}
            front64={front64}
            back64={back64}
          />
        )
      default: return null
    }
  }

  setBase64 = (name, base64) => {
    this.setState({
      [name]: `${base64}`,
    })
  }

  render() {
    return (
      <div className="App">
        <div style={{backgroundColor:'black', color:'white'}}>
          <h1>HTML5 SDK AS NODE PACKAGE DEMO</h1>
        </div>
        <div>
          {(KfxWebSDK) && (
            <div
              style={{display:'flex', justifyContent: 'center', alignItems: 'center', marginTop: '50px', flexDirection: 'column'}}
            >
              {this.getCaptureModule('id')}
            </div>
          )}
        </div>
      </div>
    );
  };
}

export default App;
