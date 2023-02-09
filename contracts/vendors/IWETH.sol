import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Creating this as I'm having issues using the solady version, doesn't seem to detect the ERC20 methods
interface WETHInterface is IERC20 {
    function deposit() external payable;

    function withdraw(uint256 amount) external;
}
