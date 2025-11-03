import React, { Component } from 'react';
import tetherLogo from '../tether.png';

class Main extends Component {
    render() {
        const web3 = window.web3;

        if (!web3) {
             return (
                <div className="text-center p-8 bg-red-900/50 text-white rounded-xl">
                    <p className="font-bold text-lg">Error: Web3 not initialized.</p>
                    <p className="text-sm">Please ensure you have an Ethereum provider (like MetaMask) connected.</p>
                </div>
            );
        }

        const fromWei = (wei) => web3.utils.fromWei(wei || '0', 'ether');
        
        const tetherBalance = fromWei(this.props.tetherBalance);
        const rwdBalance = fromWei(this.props.rwdBalance);
        const stakingBalance = fromWei(this.props.stakingBalance);
        const accruedRewards = fromWei(this.props.accruedRewards);
        
        const logoUrl = 'https://placehold.co/30x30/6366f1/ffffff?text=m';

        return (
            <div className="flex flex-col items-center justify-center min-h-full">
                <div 
                    className="w-full max-w-lg p-5 sm:p-7 rounded-3xl transition-all duration-300 text-gray-900"
                    style={{
                        backgroundColor: '#f7ebeb',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(15px)',
                    }}
                >
                    <h2 className="text-2xl font-serif font-extrabold mb-5 text-center text-gray-800 border-b border-gray-400/50 pb-2">
                        <span className='text-purple-600'>DEFI</span> STAKING DASHBOARD
                    </h2>

                    <div className="space-y-3 mb-6">
                        
                        <div className="p-1 rounded-xl border border-yellow-500/50 bg-yellow-100/40 shadow-xl">
                            <h3 className="text-md text-yellow-800 uppercase tracking-widest font-semibold font-serif">Accrued Rewards</h3>
                            <p className="text-4xl sm:text-5xl font-mono font-bold text-yellow-900 mt-0">
                                {accruedRewards} RWD
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-2 rounded-xl border border-gray-400/50 bg-gray-200/50">
                                <h3 className="text-xs text-gray-700 uppercase tracking-wider font-serif">Staked mUSDT</h3>
                                <p className="text-2xl font-mono font-bold text-gray-900 mt-1">
                                    {stakingBalance} mUSDT
                                </p>
                            </div>
                            <div className="p-2 rounded-xl border border-gray-400/50 bg-gray-200/50">
                                <h3 className="text-xs text-gray-700 uppercase tracking-wider font-serif">Wallet mUSDT</h3>
                                <p className="text-2xl font-mono font-bold text-green-700 mt-1">
                                    {tetherBalance} mUSDT
                                </p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-600 pt-1">
                             <p>Your RWD Balance: <span className='text-purple-600 font-mono'>{rwdBalance} RWD</span> | Earning Ratio: 1 RWD per 9 mUSDT staked.</p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-400/50">
                        <form onSubmit={(event) => {
                            event.preventDefault();
                            let amount = this.input.value.toString();
                            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                                console.error("Invalid deposit amount.");
                                return;
                            }
                            amount = web3.utils.toWei(amount, 'ether');
                            this.props.stakeTokens(amount);
                        }} className='mb-4'>
                            
                            <label className='block text-lg font-bold mb-2 text-gray-800 font-serif'>
                                DEPOSIT mUSDT (Stake)
                            </label>
                            
                            <div className='flex items-center p-2 rounded-xl border-2 border-indigo-600/80' style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                                <input
                                    type='text'
                                    className='w-full p-2 bg-transparent text-gray-900 focus:outline-none placeholder-gray-500 font-mono text-xl'
                                    placeholder='0.00'
                                    required
                                    ref={(input) => { this.input = input; }}
                                />
                  
                              
                            </div>

                            <button 
                                type='submit'
                                className='w-full mt-3 py-3 px-4 bg-green-600 hover:bg-green-700 text-black font-extrabold rounded-xl transition duration-150 shadow-lg shadow-green-600/50 uppercase tracking-widest text-lg font-serif text-center'
                            >
                                START STAKING
                            </button>
                        </form>

                        <button
                            type='button'
                            onClick={(event) => {
                                event.preventDefault();
                                this.props.unstakeTokens();
                            }}
                            className='w-full py-3 px-4 bg-red-700 hover:bg-red-800 text-black font-extrabold rounded-xl transition duration-150 shadow-lg shadow-red-700/50 uppercase tracking-widest text-lg font-serif'
                        >
                            UNSTAKE & CLAIM ALL REWARDS
                        </button>
                    </div>

                    <div className='mt-6 text-center text-gray-600 border-t border-gray-400/50 pt-3 text-xs'>
                        <p>Contract: <a href={`https://sepolia.etherscan.io/address/${this.props.decentralBankAddress}`} target="_blank" rel="noopener noreferrer" className='text-blue-500 hover:text-blue-400 truncate inline-block max-w-full'>{this.props.decentralBankAddress}</a></p>
                    </div>

                </div>
            </div>
        );
    }
}

export default Main;
