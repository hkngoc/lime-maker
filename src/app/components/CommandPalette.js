import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import CommandPalette from 'react-command-palette';
import { compose } from 'redux';
import { connect } from 'react-redux';

import _ from 'lodash';

import withFirestore from '../utils/withFirestore';
import * as LimeActionCreators from '../actions/limes';

import blankTemplate from '../templates/template-blank.json';
import reactTemplate from '../templates/template-react.json';

const TEMPLATES = {
  blank: blankTemplate,
  react: reactTemplate
};

import importLime from '../utils/import';
import exportLime from '../utils/export';

@autobind
class Commands extends Component {
  constructor(props) {
    super(props);

    this.state = {
      commands: this.getCommandList()
    }
  }

  getCommandList() {
    return [{
      category: 'command',
      id: 1,
      name: 'New Lime',
      command: this.handleSelectCreateProfile
    }, {
      category: 'command',
      id: 2,
      name: 'Fork Lime',
      command: this.handleSelectProfile.bind(this, "onForkProfile")
    }, {
      category: 'command',
      id: 3,
      name: 'Remove Lime',
      command: this.handleSelectProfile.bind(this, "onRemoveProfile")
    }, {
      category: 'command',
      id: 4,
      name: 'Open Lime',
      command: this.handleSelectProfile.bind(this, "onOpenProfile", true)
    }, {
      category: 'command',
      id: 5,
      name: 'Add library',
      command: this.handleAddLibrary
    }, {
      category: 'command',
      id: 6,
      name: 'Import Lime fron json',
      command: this.handleImportProfile
    }, {
      category: 'command',
      id: 7,
      name: 'Export Lime to json',
      command: this.handleSelectProfile.bind(this, "onExportProfile")
    }, {
      category: 'command',
      id: 8,
      name: 'Export all Lime to json',
      command: this.handleExportAllProfile
    },{
      category: 'command',
      id: 9,
      name: 'Compare with other lime',
      command: this.handleSelectProfile.bind(this, "onCompareProfile", true)
    }, {
      category: 'command',
      id: 10,
      name: 'Compare with json file',
      command: this.handleImportCompareProfile
    }];
  }

  defaultCommand() {
    this.refs.cmd.handleCloseModal();
  }

  handleAddLibrary() {
    const { onRequestAddLibrary } = this.props;
    if (onRequestAddLibrary) {
      onRequestAddLibrary();
    }

    this.defaultCommand();
  }

  async handleImportCompareProfile() {
    this.defaultCommand();
    try {
      const template = await importLime();
      const { onCompare } = this.props;
      if (onCompare) {
        onCompare(template);
      }
    } catch(e) {
    }
  }

  onCompareProfile(id) {
    const { limes, onCompare } = this.props;

    let lime = _.find(limes, l => l.id == id);
    if (lime && onCompare) {
      onCompare(lime);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////
  async createProfile(lime) {
    const { firestore, auth: { uid }, authorized } = this.props;
    const { id, createdAt, updatedAt, ...template } = lime;

    if (authorized) {
      const { id } = await firestore.add({
        collection: "users",
        doc: uid,
        subcollections: [{
          collection: "limes"
        }]
      }, {
        ...template,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      return id;
    } else {
      const { dispatch } = this.props;

      let action = LimeActionCreators.addLime(lime);
      const { nextId } = dispatch(action);
      return nextId;
    }
  }

  async handleImportProfile() {
    this.defaultCommand();
    try {
      const template = await importLime();
      template.title = `(Imported) ${template.title}`;

      await this.createProfile(template);

      this.notifyChange();
    } catch(e) {
    }
  }

  async onCreate(type) {
    const template = TEMPLATES[type];
    template.title = `Untitled ${new Date().toLocaleString()}`;

    const { firestore, auth: { uid }, authorized } = this.props;

    const nextId = await this.createProfile(template);
    if (nextId) {
      this.onOpenProfile(nextId);
    }

    this.refs.cmd.handleCloseModal();
    this.handleClose();

    this.notifyChange();
  }

  async resetInput() {
    return new Promise((resolve) => {
      this.refs.cmd.setState({
        value: ""
      }, () => {
        resolve();
      });
    });
  }

  async handleSelectCreateProfile() {
    await this.resetInput();
    let commands = ["blank", "react"].map((type, index) => ({
      id: index,
      name: type,
      category: "creator",
      command: this.onCreate.bind(this, type)
    }));

    this.setState({
      commands
    });
  }

  async onRemoveProfile(id) {
    const { firestore, auth: { uid }, authorized, limes } = this.props;

    if (authorized) {
      await firestore.delete({
        collection: "users",
        doc: uid,
        subcollections: [{
          collection: "limes",
          doc: id
        }]
      });
    } else {
      const { dispatch } = this.props;

      let action = LimeActionCreators.removeLime(id);
      dispatch(action);
    }

    // check empty and add default
    let lime = _.find(limes, l => l.id != id);
    if (!lime) {
      await this.onCreate("react");
    }
  }

  async onForkProfile(id) {
    const { limes } = this.props;

    const { id: lId, ...template } = _.find(limes, l => l.id == id);
    template.title = `(Forked) ${template.title}`;

    const nextId = await this.createProfile(template);
    if (nextId) {
      this.onOpenProfile(nextId);
    }
  }

  onExportProfile(id) {
    const { limes } = this.props;

    let lime = _.find(limes, l => l.id == id);
    if (lime) {
      exportLime(lime);
    }
  }

  handleExportAllProfile() {
    this.refs.cmd.handleCloseModal();
    this.handleClose();
    this.notifyChange();

    const { limes } = this.props

    exportLime(limes);
  }

  onOpenProfile(id) {
    const { onOpenProfile } = this.props;

    if (onOpenProfile) {
      onOpenProfile(id);
    }
  }

  async onSelectProfile(type, id) {
    if (this[type]) {
      await this[type](id);
    }

    this.refs.cmd.handleCloseModal();
    this.handleClose();
    this.notifyChange();
  }

  async handleSelectProfile(type, ignoreCurrent = false) {
    await this.resetInput();
    this.refs.cmd.handleOpenModal();

    const { limes, opened } = this.props;

    let commands = _(limes)
      .map(lime => ({
        id: lime.id,
        name: lime.title,
        category: type,
        command: this.onSelectProfile.bind(this, type, lime.id)
      }))
      // .orderBy(['id'], ['desc'])
      .value();
    if (ignoreCurrent) {
      commands = _.reject(commands, c => c.id == opened);
    }

    this.setState({
      commands
    });
  }

  handleClose() {
    this.setState({
      commands: this.getCommandList()
    })
  }

  notifyChange() {
    const { onChangeProfile } = this.props;
    if (onChangeProfile) {
      onChangeProfile();
    }
  }

  renderTrigger() {
    return (
      <div/>
    )
  }

  renderHeader() {
    return (
      <div style={{color: 'rgb(172, 172, 172)', display: 'inline-block', fontFamily: 'arial', fontSize: '12px', marginBottom: '6px'}}>
        <span style={{paddingRight: '32px'}}>Search for a command</span>
        <span style={{paddingRight: '32px'}}>
          <kbd style={{backgroundColor: 'rgb(23, 23, 23)', borderRadius: '4px', color: '#b9b9b9', fontSize: '12px', marginRight: '6px', padding: '2px 4px'}}>↑↓</kbd>to navigate
        </span>
        <span style={{paddingRight: '32px'}}>
          <kbd style={{backgroundColor: 'rgb(23, 23, 23)', borderRadius: '4px', color: '#b9b9b9', fontSize: '12px', marginRight: '6px', padding: '2px 4px'}}>enter</kbd> to select
        </span>
        <span style={{paddingRight: '32px'}}>
          <kbd style={{backgroundColor: 'rgb(23, 23, 23)', borderRadius: '4px', color: '#b9b9b9', fontSize: '12px', marginRight: '6px', padding: '2px 4px'}}>esc</kbd> to dismiss
        </span>
      </div>
    )
  }

  render() {
    const { commands } = this.state;

    return (
      <CommandPalette
        ref="cmd"
        alwaysRenderCommands={true}
        commands={commands}
        trigger={this.renderTrigger()}
        header={this.renderHeader()}
        onSelect={this.handleSelect}
        closeOnSelect={false}
        onRequestClose={this.handleClose}
        showSpinnerOnSelect={false}
        maxDisplayed={100}
        highlightFirstSuggestion={true}
        resetInputOnClose={true}/>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { limes } = ownProps;

  return {
    limes: _(limes).values().orderBy(['createdAt.seconds'], ['desc']).value()
  }
};

export default compose(
  withFirestore({ forwardRef: true }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true }),
)(Commands);
