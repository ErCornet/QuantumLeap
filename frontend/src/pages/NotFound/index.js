import React from 'react'
import { Typography, Paper, } from '@material-ui/core'
import { withTheme } from '@material-ui/core/styles'

class NotFound extends React.Component {
  render() {
    const { theme } = this.props;
    return (
      <Paper style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3), padding: theme.spacing(2), backgroundColor: theme.palette.grey[50] }}>
        <Typography variant='h2'>
          Not found.
        </Typography>
      </Paper>
    );
  }
}

export default withTheme(NotFound);