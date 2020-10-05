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

const ACCEPT_FULL = [
  "application/json",
  "zip",
  "application/octet-stream",
  "application/zip",
  "application/x-zip",
  "application/x-zip-compressed"
];

import importLime, { checkLime, trimLime, extractLime, extractLimehub, removeFolder } from '../utils/import';
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
      category: 'Command',
      id: 1,
      name: 'New Lime',
      command: this.handleSelectCreateProfile
    }, {
      category: 'Command',
      id: 2,
      name: 'Fork Lime',
      command: this.handleSelectProfile.bind(this, "onForkProfile")
    }, {
      category: 'Command',
      id: 3,
      name: 'Remove Lime',
      command: this.handleSelectProfile.bind(this, "onRemoveProfile")
    }, {
      category: 'Command',
      id: 4,
      name: 'Open Lime',
      command: this.handleSelectProfile.bind(this, "onOpenProfile", true)
    }, {
      category: 'Command',
      id: 5,
      name: 'Add library',
      command: this.handleAddLibrary
    }, {
      category: 'Command',
      id: 6,
      name: 'Import Lime fron json',
      command: this.handleImportProfile
    }, {
      category: 'Command',
      id: 7,
      name: 'Export Lime to json',
      command: this.handleSelectProfile.bind(this, "onExportProfile")
    }, {
      category: 'Command',
      id: 8,
      name: 'Export all Lime to json',
      command: this.handleExportAllProfile
    },{
      category: 'Command',
      id: 9,
      name: 'Compare with other lime',
      command: this.handleSelectProfile.bind(this, "onCompareProfile", true)
    }, {
      category: 'Command',
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
      if (!checkLime(template)) {
        return;
      }
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

    if (authorized) {
      const { id } = await firestore.add({
        collection: "users",
        doc: uid,
        subcollections: [{
          collection: "limes"
        }]
      }, {
        ...lime,
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

  async handleDropAcceptFile(file) {
    const { type } = file;
    if (type == "application/json") {
      const json = await extractLime(file);
      if (!checkLime(json)) {
        throw Error("invalid format");
      }
      const template = trimLime(json);
      template.title = `(Imported) ${template.title}`;
      await this.createProfile(template);
      // throw toast success
    } else {
      // need logic check that only work on un-authorized
      const id = await this.createProfile({
        ...blankTemplate,
        title: `(Imported) ${file.name}`,
        type: "Limehub"
      });
      // unzip and write to folder id with Window.PERSISTENT type
      await extractLimehub(file, id);
    }

    this.notifyChange();
  }

  async handleImportProfile() {
    const { onTonOfLoading, authorized } = this.props;
    this.defaultCommand();

    try {
      if (onTonOfLoading) {
        onTonOfLoading(true);
      }
      const file = await importLime(authorized ? "application/json" : _.join(ACCEPT_FULL, ","));
      await this.handleDropAcceptFile(file);
    } catch (e) {
      console.error(e);
    } finally {
      if (onTonOfLoading) {
        onTonOfLoading(false);
      }
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
    this.defaultCommand();
    const { firestore, auth: { uid }, authorized, limes, onTonOfLoading } = this.props;

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

    const { type } = _.find(limes, l => l.id == id);
    if (type == "Limehub") {
      try {
        if (onTonOfLoading) {
          onTonOfLoading(true);
        }
        await removeFolder(1024*1024*10, id);
      } catch (e) {
        console.error(e);
      } finally {
        if (onTonOfLoading) {
          onTonOfLoading(false);
        }
      }
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
      .map((lime) => ({
        id: lime.id,
        name: lime.title,
        category: lime.type || "Lime",
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

  renderCommand(suggestion) {
    const { name, highlight, category, shortcut } = suggestion;

    return (
      <div className="item">
        <span className={`atom-category ${category}`}></span>
        {highlight ? (
          <span dangerouslySetInnerHTML={{ __html: highlight }} />
        ) : (
          <span>{name}</span>
        )}
        {
          shortcut && <kbd className="atom-shortcut">{shortcut}</kbd>
        }
      </div>
    );
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
        resetInputOnClose={true}
        renderCommand={this.renderCommand}
      />
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
