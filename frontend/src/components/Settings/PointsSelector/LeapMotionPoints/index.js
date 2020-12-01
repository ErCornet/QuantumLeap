import React from 'react';
import { Box, Checkbox } from '@material-ui/core'; 
import { withStyles } from '@material-ui/core/styles';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import { ReactComponent as LeapHands } from './hands.svg';
import { ReactComponent as LeapBones } from './handsbones.svg';

const styles = (theme) => ({
  root: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'rgb(150, 150, 150)',
    paddingTop: '30px',
    boxSizing: 'border-box',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
  image: {
    color: 'white',
    verticalAlign: 'top',
  },
  imageBones: {
    position: 'absolute',
    color: 'rgb(220, 220, 220)',
    verticalAlign: 'top',
    zIndex: 0
  },
  checkboxes: {
    position: 'absolute',
    fontSize: '2em',
    transform: 'translate(-50%, -50%)',
    zIndex: 1
  },
});

class LeapMotionPoints extends React.Component {
  render() {
    const { classes, selectedJoints, sensorId, onSelect, onDeselect } = this.props;
    const clickHandler = function(selected, jointName) {
      if (selected) {
        onSelect([jointName]);
      } else {
        onDeselect([jointName]);
      }
    };
    return (
      <div className={classes.root}>
        <div className={classes.container}>
          {/* Left hand */}
          {/* Palm */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftPalmPosition' x={24} y={44} onToggle={clickHandler}/>
          {/* Tips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftPinkyTipPosition' x={9} y={17.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftRingTipPosition' x={20} y={6.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftMiddleTipPosition' x={28.5} y={2} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftIndexTipPosition' x={36.1} y={8.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftThumbTipPosition' x={45} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftPinkyPipPosition' x={12.7} y={28.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftRingPipPosition' x={20.2} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftMiddlePipPosition' x={27.2} y={16.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftIndexPipPosition' x={33.7} y={21.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftThumbPipPosition' x={36.5} y={51} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftPinkyMcpPosition' x={16.5} y={37.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftRingMcpPosition' x={21} y={35.1} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftMiddleMcpPosition' x={25.6} y={31.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftIndexMcpPosition' x={30.3} y={33.9} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='leftThumbMcpPosition' x={30} y={58.5} onToggle={clickHandler}/>

          {/* Right hand */}
          {/* Palm */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightPalmPosition' x={76} y={44} onToggle={clickHandler}/>
          {/* Tips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightPinkyTipPosition' x={91} y={17.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightRingTipPosition' x={80} y={6.6} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightMiddleTipPosition' x={71.5} y={2} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightIndexTipPosition' x={63.9} y={8.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightThumbTipPosition' x={55} y={43.5} onToggle={clickHandler}/>
          {/* Pips */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightPinkyPipPosition' x={87.3} y={28.5} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightRingPipPosition' x={79.8} y={21} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightMiddlePipPosition' x={72.8} y={16.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightIndexPipPosition' x={66.3} y={21.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightThumbPipPosition' x={63.5} y={51} onToggle={clickHandler}/>
          {/* Mcps */}
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightPinkyMcpPosition' x={83.5} y={37.8} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightRingMcpPosition' x={79} y={35.1} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightMiddleMcpPosition' x={74.4} y={31.7} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightIndexMcpPosition' x={69.7} y={33.9} onToggle={clickHandler}/>
          <CustomCheckbox classes={classes} selectedJoints={selectedJoints} sensorId={sensorId} joint='rightThumbMcpPosition' x={70} y={58.5} onToggle={clickHandler}/>
          
          <LeapBones fill='currentColor' className={classes.imageBones}/>
          <LeapHands fill='currentColor' className={classes.image}/>
        </div>
      </div>
    );
  }
}

function CustomCheckbox({classes, selectedJoints, sensorId, joint, x, y, onToggle}) {
  let jointName = sensorId ? `${joint}_${sensorId}` : joint;
  return (
    <Checkbox 
      className={classes.checkboxes} 
      onClick={(event) => onToggle(event.target.checked, jointName)}
      checked={selectedJoints.indexOf(jointName) !== -1}
      disableRipple
      size='small'
      color='primary' 
      icon={<RadioButtonUncheckedIcon />}
      checkedIcon={<RadioButtonCheckedIcon />} 
      style={{ left: `${x}%`, top: `${y}%` }} 
    />
  )
}

export default withStyles(styles)(LeapMotionPoints);