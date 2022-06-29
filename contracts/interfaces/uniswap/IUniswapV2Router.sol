// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0;

interface IUniswapV2Router { 
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut);
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}
