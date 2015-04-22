class Jam < ActiveRecord::Base
  has_many :guests
  belongs_to :user

  validates :user,
    presence: true,
  uniqueness: { scope: :name }

  validates :name,
    presence: true
end
