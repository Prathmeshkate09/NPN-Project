#!/usr/bin/env python3
"""
Compare old vs new EMI calculation methods to demonstrate the improvement.
"""

def old_emi_calculation(loan_amount, tenure):
    """Old method: Simple division (incorrect)"""
    return loan_amount / tenure if tenure > 0 else 0

def new_emi_calculation(principal, annual_rate, tenure_months):
    """New method: Proper compound interest formula"""
    if tenure_months <= 0 or annual_rate < 0:
        return 0.0
    
    if annual_rate == 0:
        return principal / tenure_months
    
    monthly_rate = annual_rate / (12 * 100)
    numerator = principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)
    denominator = ((1 + monthly_rate) ** tenure_months) - 1
    
    return numerator / denominator

# Test with actual values from our API response
loan_amount = 263920.0
tenure = 33
interest_rate = 13.68

old_emi = old_emi_calculation(loan_amount, tenure)
new_emi = new_emi_calculation(loan_amount, interest_rate, tenure)

total_old = old_emi * tenure
total_new = new_emi * tenure
interest_old = 0  # Old method completely ignores interest
interest_new = total_new - loan_amount

print("=== EMI CALCULATION COMPARISON ===")
print(f"Loan Amount: ₹{loan_amount:,.2f}")
print(f"Interest Rate: {interest_rate}% p.a.")
print(f"Tenure: {tenure} months")
print()

print("OLD METHOD (Simple Division - INCORRECT):")
print(f"  Monthly EMI: ₹{old_emi:,.2f}")
print(f"  Total Payment: ₹{total_old:,.2f}")
print(f"  Total Interest: ₹{interest_old:,.2f} (WRONG - ignores interest!)")
print()

print("NEW METHOD (Compound Interest Formula - CORRECT):")
print(f"  Monthly EMI: ₹{new_emi:,.2f}")
print(f"  Total Payment: ₹{total_new:,.2f}")
print(f"  Total Interest: ₹{interest_new:,.2f}")
print()

print("IMPACT:")
print(f"  EMI Difference: ₹{new_emi - old_emi:,.2f} (+{((new_emi/old_emi - 1)*100):,.1f}%)")
print(f"  Total Cost Difference: ₹{total_new - total_old:,.2f}")
print(f"  Interest Component: ₹{interest_new:,.2f} (was completely missing!)")