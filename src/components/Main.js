import React, { Component } from 'react'
import tether from '../tether.png'

class Main extends Component {

  render() {
    return (
      <div id='content' className='mt-3'>
        <table className='table text-muted text-center'>
          <thead>
            <tr style={{ color: 'white' }}>
              <th scope='col'>Staking Balance</th>
              <th scope='col'>Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ color: 'white' }}>
              <td>{window.web3.utils.fromWei(this.props.stakingBalance, 'ether')} USDT</td>
              <td>{window.web3.utils.fromWei(this.props.rwdBalance, 'ether')} RWD</td>
            </tr>
          </tbody>
        </table>
        <div className='card mb-2' style={{ opacity: '.9' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              let amount = this.input.value.toString()
              amount = window.web3.utils.toWei(amount, 'ether')
              this.props.stakeTokens(amount)
            }}
            className='mb-3'>
            <div style={{ border: '1px dashed grey' }} className='card-body text-center'>
              <div style={{ color: 'black' }}>
                <label className='float-left'><b>Stake Tokens</b></label>
                <span className='float-right'>
                  Balance: {window.web3.utils.fromWei(this.props.tetherBalance, 'ether')}
                </span>
                <div className='input-group mb-4'>
                  <input
                    ref={(input) => { this.input = input }}
                    type='text'
                    placeholder='0'
                    required />
                  <div className='input-group-append'>
                    <div className='input-group-text'>
                      <img src={tether} alt='tether' height='20' />
                      &nbsp;&nbsp;&nbsp; mUSDT
                    </div>
                  </div>
                </div>
                <button type='submit' className='btn btn-primary btn-lg btn-block'>DEPOSIT</button>
              </div>
            </div>
          </form>
          <button
            type='submit'
            onClick={(event) => {
              event.preventDefault()
              this.props.unstakeTokens()
            }}
            className='btn btn-primary btn-lg btn-block'>UNSTAKE
          </button>
          
        </div>
      </div>
    );
  }
}

export default Main;
