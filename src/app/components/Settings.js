import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';

import {
  Modal,
  Tab,
  Row,
  Col,
  Nav,
  Form,
  Button,
  Alert
} from 'react-bootstrap';

import * as SettingsActionCreators from '../actions/settings';

import Auth from './Auth';

@autobind
class Settings extends Component{
  constructor(props) {
    super(props);
    this.state = {
      show: false
    }
  }

  handleClose() {
    this.setState({
      show: false
    })
  }

  handleShow() {
    this.setState({
      show: true
    })
  }

  onSettingChange(key, e, value) {
    let { dispatch } = this.props;

    let action = SettingsActionCreators.update(key, value ? value : e.target.value);
    dispatch(action);
  }

  onToggeSetting(key) {
    let { dispatch } = this.props;

    let action = SettingsActionCreators.toggle(key);
    dispatch(action);
  }

  render() {
    const { show } = this.state;
    const { 
      setting: {
        lastTab = "zero",
        editor: {
          theme,
          options: {
            fontSize,
            tabSize,
            wordWrap,
            renderWhitespace,
            indention = 2,
            minimap: {
              enabled: minimapEnabled,
              maxColumn,
              renderCharacters,
              scale,
              showSlider,
              side
            }
          }
        },
        general: {
          loop_protect: {
            enabled: loopProtectEnabled,
            timeout
          }
        } = {
          loop_protect: {
            enabled: false,
            timeout: 100
          }
        }
      },
      onUserFirstLogged,
      authorized
    } = this.props;

    return (
      <Modal
        show={show}
        onHide={this.handleClose}
        scrollable
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body className="setting-body">
          <Tab.Container defaultActiveKey={lastTab}>
            <Row>
              <Col sm={3} className="flex flex-column">
                <Nav className="flex-column nav-tabs-vertical">
                  <Nav.Item>
                    <Nav.Link eventKey="zero">Auth</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="first">General</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="second">Editor</Nav.Link>
                  </Nav.Item>
                </Nav>
                <div className="nav-remain"></div>
              </Col>
              <Col sm={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="zero" onEntered={(e) => this.onSettingChange.bind(this)("lastTab", e, "zero")}>
                    <Auth
                      onUserFirstLogged={onUserFirstLogged}
                      authorized={authorized}
                    />
                  </Tab.Pane>
                  <Tab.Pane eventKey="first" onEntered={(e) => this.onSettingChange.bind(this)("lastTab", e, "first")}>
                    <div className="loop-protect-setting">
                      <Form.Label column className="text-center"><code><a href="https://github.com/jsbin/loop-protect">Loop protect</a></code></Form.Label>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Enable</Form.Label>
                          <Col className="switch-setting">
                            <Form.Check
                              id="loop-protect-enable"
                              custom
                              type="switch"
                              label=""
                              checked={loopProtectEnabled}
                              onChange={this.onToggeSetting.bind(this, "general.loop_protect.enabled")}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Timeout</Form.Label>
                          <Col>
                            <div className="input-timeout">
                              <Form.Control
                                type="number"
                                size="sm"
                                className="input-setting"
                                disabled={!loopProtectEnabled}
                                value={timeout}
                                min={100}
                                onChange={this.onSettingChange.bind(this, "general.loop_protect.timeout")}
                              />
                            </div>
                          </Col>
                        </Form.Row>
                      </Form.Group>
                    </div>
                    <hr/>
                    <div className="instant-run-setting">
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Instant Run</Form.Label>
                          <Col className="switch-setting">
                            <Form.Check
                              id="instant-run-enable"
                              custom
                              type="switch"
                              label=""
                              checked={true}
                              disabled={true}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="second" onEntered={(e) => this.onSettingChange.bind(this)("lastTab", e, "second")}>
                    <code>This extension use "<a href="https://microsoft.github.io/monaco-editor/"><strong>Monaco Editor</strong></a>", some setting appear here:</code>
                    <hr/>
                    <Form.Group>
                      <Form.Row>
                        <Form.Label column size="sm">Theme</Form.Label>
                        <Col>
                          <Form.Control
                            as="select"
                            size="sm"
                            className="select-setting"
                            value={theme}
                            onChange={this.onSettingChange.bind(this, "editor.theme")}
                          >
                            <option>vs-light</option>
                            <option>vs-dark</option>
                            <option>monokai</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <hr/>
                    <Form.Group>
                      <Form.Row>
                        <Form.Label column size="sm">Font Size</Form.Label>
                        <Col>
                          <div className="input-font-size">
                            <Form.Control
                              type="number"
                              size="sm"
                              className="input-setting"
                              value={fontSize}
                              min={9}
                              onChange={this.onSettingChange.bind(this, "editor.options.fontSize")}/>
                          </div>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <hr/>
                    <Form.Group>
                      <Form.Row>
                        <Form.Label column size="sm">Render Whitespace</Form.Label>
                        <Col>
                          <Form.Control
                            as="select"
                            size="sm"
                            className="select-setting"
                            value={renderWhitespace}
                            onChange={this.onSettingChange.bind(this, "editor.options.renderWhitespace")}
                          >
                            <option>none</option>
                            <option>boundary</option>
                            <option>selection</option>
                            <option>all</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <hr/>
                    <Form.Group>
                      <Form.Row>
                        <Form.Label column size="sm" title="refresh to apply">Indention</Form.Label>
                        <Col>
                          <Form.Control
                            type="number"
                            size="sm"
                            className="input-setting"
                            value={indention}
                            min={1}
                            max={8}
                            onChange={this.onSettingChange.bind(this, "editor.options.indention")}/>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <hr/>
                    <div className="minimap-setting">
                      <Form.Label column className="text-center"><code>Minimap</code></Form.Label>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Enable</Form.Label>
                          <Col className="switch-setting">
                            <Form.Check
                              id="minimap-enable"
                              custom
                              type="switch"
                              label=""
                              checked={minimapEnabled}
                              onChange={this.onToggeSetting.bind(this, "editor.options.minimap.enabled")}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Max Column</Form.Label>
                          <Col>
                            <Form.Control
                              type="number"
                              size="sm"
                              className="input-setting"
                              disabled={!minimapEnabled}
                              value={maxColumn}
                              onChange={this.onSettingChange.bind(this, "editor.options.minimap.maxColumn")}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Render Character</Form.Label>
                          <Col className="switch-setting">
                            <Form.Switch
                              id="minimap-render-character"
                              label=""
                              disabled={!minimapEnabled}
                              checked={renderCharacters}
                              onChange={this.onToggeSetting.bind(this, "editor.options.minimap.renderCharacters")}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Scale</Form.Label>
                          <Col>
                            <Form.Control
                              type="number"
                              size="sm"
                              className="input-setting"
                              disabled={!minimapEnabled}
                              value={scale}
                              onChange={this.onSettingChange.bind(this, "editor.options.minimap.scale")}
                            />
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row>
                          <Form.Label column size="sm">Show Slider</Form.Label>
                          <Col>
                            <Form.Control
                              as="select"
                              size="sm"
                              className="select-setting"
                              disabled={!minimapEnabled}
                              value={showSlider}
                              onChange={this.onSettingChange.bind(this, "editor.options.minimap.showSlider")}
                            >
                              <option>always</option>
                              <option>mouseover</option>
                            </Form.Control>
                          </Col>
                        </Form.Row>
                      </Form.Group>
                      <Form.Group>
                        <Form.Row >
                          <Form.Label column size="sm">Side</Form.Label>
                          <Col>
                            <Form.Control
                              as="select"
                              size="sm"
                              className="select-setting"
                              disabled={!minimapEnabled}
                              value={side}
                              onChange={this.onSettingChange.bind(this, "editor.options.minimap.side")}
                            >
                              <option>left</option>
                              <option>right</option>
                            </Form.Control>
                          </Col>
                        </Form.Row>
                      </Form.Group>
                    </div>
                    <hr/>
                    <Form.Group>
                      <Form.Row>
                        <Form.Label column size="sm">Word wrap</Form.Label>
                        <Col className="switch-setting">
                          <Form.Control
                            as="select"
                            size="sm"
                            className="select-setting"
                            disabled={true}
                            value={wordWrap}
                            onChange={this.onSettingChange.bind(this, "editor.options.wordWrap")}
                          >
                            <option>off</option>
                            <option>on</option>
                            <option>wordWrapColumn</option>
                            <option>bounded</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  let { setting } = state;

  return {
    setting
  }
};

export default connect(mapStateToProps, null, null, { pure: false, forwardRef: true  })(Settings);
